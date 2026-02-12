CREATE OR REPLACE TRIGGER NICOTST.TRG_AD_ZNTITEMCONF_SYNC
FOR INSERT OR UPDATE ON AD_FECCAR
COMPOUND TRIGGER

    TYPE t_nufechamento IS TABLE OF AD_FECCAR.NUFECHAMENTO%TYPE;
    v_lista_nufechAMENTO t_nufechamento := t_nufechamento();

    AFTER EACH ROW IS
    BEGIN
        IF NOT (v_lista_nufechAMENTO.EXISTS(:NEW.NUFECHAMENTO)) THEN
            v_lista_nufechAMENTO.EXTEND;
            v_lista_nufechAMENTO(v_lista_nufechAMENTO.LAST) := :NEW.NUFECHAMENTO;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        V_NUUNICO    NUMBER;
        V_ULTIMO_REG NUMBER;
    BEGIN
        FOR i IN 1..v_lista_nufechAMENTO.COUNT LOOP
            
            BEGIN
                SELECT NUUNICO INTO V_NUUNICO FROM AD_ZNTCONFCAB WHERE NUFECHAMENTO = v_lista_nufechAMENTO(i);
            EXCEPTION WHEN NO_DATA_FOUND THEN
                SELECT NVL(MAX(NUUNICO), 0) + 1 INTO V_NUUNICO FROM AD_ZNTCONFCAB;
                INSERT INTO AD_ZNTCONFCAB (NUUNICO, NUFECHAMENTO, CONFERIDO, CODUSU)
                SELECT V_NUUNICO, v_lista_nufechAMENTO(i), 'N', CODUSU
                  FROM AD_FECCAR WHERE NUFECHAMENTO = v_lista_nufechAMENTO(i);
            END;

            DELETE FROM AD_ZNTITEMCONF WHERE NUUNICO = V_NUUNICO AND NVL(CONFERIDO, 'N') <> 'S';

            SELECT NVL(MAX(NUMREG), 0) INTO V_ULTIMO_REG FROM AD_ZNTITEMCONF WHERE NUUNICO = V_NUUNICO;

            INSERT INTO AD_ZNTITEMCONF (
                NUMREG, NUUNICO, NUFECHAMENTO, CODPROD, CODVOL, MARCA, DESCVOL, EAN, DUN, QUANT, CONFERIDO, TIPO, DESCRPROD
            )
            SELECT 
                V_ULTIMO_REG + ROW_NUMBER() OVER (ORDER BY TIPO DESC, CODPROD),
                V_NUUNICO,
                v_lista_nufechAMENTO(i),
                -- TIPO C não tem ID numérico, enviamos NULL para não quebrar. A descrição salva o nome.
                CASE WHEN D.TIPO = 'C' THEN NULL 
                     WHEN REGEXP_LIKE(D.CODPROD, '^[0-9]+$') THEN TO_NUMBER(D.CODPROD) 
                     ELSE NULL END,
                D.CODVOL,
                D.MARCA,
                D.DESCRDANFE,
                TO_NUMBER(SUBSTR(REGEXP_REPLACE(D.REFERENCIA, '[^0-9]', ''), 1, 15)),
                TO_NUMBER(SUBSTR(REGEXP_REPLACE(D.CODBARRA4DIG, '[^0-9]', ''), 1, 15)),
                D.QTDNEG, -- Removido arredondamento forçado que podia zerar decimal
                'N',
                D.TIPO,
                D.DESCRPROD -- Nova coluna
            FROM (
                -- PARTE 1: TGF (Estoque)
                SELECT 
                    CASE WHEN CAB.AD_AGRUPROM IS NOT NULL THEN ' ' || TO_CHAR(CAB.AD_AGRUPROM) ELSE COM.TIPO END AS TIPO,
                    TO_CHAR(ITE.CODPROD) AS CODPROD,
                    ITE.CODVOL,
                    NVL(PRO.MARCA, ' ') AS MARCA,
                    NVL(VOA.DESCRDANFE, ' ') AS DESCRDANFE,
                    PRO.REFERENCIA,
                    SUBSTR(BAR.CODBARRA, -4) AS CODBARRA4DIG,
                    PRO.DESCRPROD, -- Pega descrição do cadastro
                    SUM((CASE WHEN VOA.CODPROD IS NULL THEN ITE.QTDNEG
                              WHEN VOA.DIVIDEMULTIPLICA = 'D' THEN ITE.QTDNEG * VOA.QUANTIDADE
                              ELSE ITE.QTDNEG / VOA.QUANTIDADE END)) AS QTDNEG
                FROM AD_FECCAR FEC
                INNER JOIN AD_FECCOM COM ON FEC.NUFECHAMENTO = COM.NUFECHAMENTO
                INNER JOIN TGFCAB CAB ON CAB.ORDEMCARGA = COM.NUMDOCUMENTO
                INNER JOIN TGFITE ITE ON ITE.NUNOTA = CAB.NUNOTA
                INNER JOIN TGFPRO PRO ON ITE.CODPROD = PRO.CODPROD
                INNER JOIN TGFEMP EMP ON EMP.CODEMP = CAB.CODEMP
                LEFT JOIN TGFVOA VOA ON (VOA.CODPROD = ITE.CODPROD AND VOA.CODVOL = ITE.CODVOL 
                     AND ((ITE.CONTROLE IS NULL AND VOA.CONTROLE = ' ') OR (ITE.CONTROLE IS NOT NULL AND ITE.CONTROLE = VOA.CONTROLE)))
                LEFT JOIN TGFVOA BAR ON (BAR.CODPROD = ITE.CODPROD AND BAR.UNIDTRIB = 'S' 
                     AND ((ITE.CONTROLE IS NULL AND BAR.CONTROLE = ' ') OR (ITE.CONTROLE IS NOT NULL AND ITE.CONTROLE = BAR.CONTROLE)))
                WHERE FEC.NUFECHAMENTO = v_lista_nufechAMENTO(i)
                  AND CAB.TIPMOV = 'P'
                  AND COM.TIPO = 'O'
                  AND ITE.USOPROD <> 'D'
                  AND NVL(CAB.STATUSNFE, 'X') <> 'D'
                  AND COM.CODEMP = NVL(EMP.CODEMPOC, EMP.CODEMP)
                GROUP BY CASE WHEN CAB.AD_AGRUPROM IS NOT NULL THEN ' ' || TO_CHAR(CAB.AD_AGRUPROM) ELSE COM.TIPO END,
                         TO_CHAR(ITE.CODPROD), ITE.CODVOL, SUBSTR(BAR.CODBARRA, -4), ITE.CONTROLE, PRO.MARCA, VOA.DESCRDANFE, PRO.REFERENCIA, PRO.DESCRPROD

                UNION ALL

                -- PARTE 2: TMS (Frete)
                SELECT 
                    COM.TIPO,
                    NVL(TO_CHAR(PRO.CODPROD),'NFe ' || TO_CHAR(NOTA.NUMNOTA)) AS CODPROD,
                    NVL(VOA.CODVOL,ITE.CODVOL) AS CODVOL,
                    NVL(PRO.MARCA,' ') AS MARCA,
                    NVL(VOA.DESCRDANFE,' ') AS DESCRDANFE,
                    NVL(PRO.REFERENCIA,' ') AS REFERENCIA,
                    ' ' AS CODBARRA4DIG,
                    NVL(PRO.DESCRPROD, ITE.DESCRPROD) AS DESCRPROD, -- Pega descrição do item da nota TMS
                    SUM(ITE.QTDNEG) AS QTDNEG
                FROM TMSNOTAS NOTA
                INNER JOIN TMSNOTASITE ITE ON NOTA.NROUNICO = ITE.NROUNICO
                INNER JOIN AD_FECCOM COM ON NOTA.NUNOTACTE = COM.NUMDOCUMENTO
                INNER JOIN AD_FECCAR FEC ON FEC.NUFECHAMENTO = COM.NUFECHAMENTO
                LEFT JOIN (
                    SELECT CODPARC, UNIDADE, CODPROPARC, MAX(SEQUENCIA) AS MAX_SEQ
                    FROM TGFPAP
                    GROUP BY CODPARC, UNIDADE, CODPROPARC
                ) PAP_MAX ON NOTA.CODPARCREM = PAP_MAX.CODPARC AND ITE.CODVOL = PAP_MAX.UNIDADE AND ITE.CODPROPARC = PAP_MAX.CODPROPARC
                LEFT JOIN TGFPAP PAP ON PAP.CODPARC = PAP_MAX.CODPARC AND PAP.UNIDADE = PAP_MAX.UNIDADE AND PAP.CODPROPARC = PAP_MAX.CODPROPARC AND PAP.SEQUENCIA = PAP_MAX.MAX_SEQ
                LEFT JOIN TGFPRO PRO ON PAP.CODPROD = PRO.CODPROD
                LEFT JOIN TGFVOA VOA ON PRO.CODPROD = VOA.CODPROD AND PAP.UNIDADEPARC = VOA.CODVOL
                WHERE COM.TIPO = 'C'
                  AND FEC.NUFECHAMENTO = v_lista_nufechAMENTO(i)
                GROUP BY COM.TIPO, NVL(TO_CHAR(PRO.CODPROD),'NFe ' || TO_CHAR(NOTA.NUMNOTA)), NVL(VOA.CODVOL,ITE.CODVOL),
                         NVL(PRO.MARCA,' '), NVL(VOA.DESCRDANFE,' '), NVL(PRO.REFERENCIA,' '), NVL(PRO.DESCRPROD, ITE.DESCRPROD)
            ) D
            WHERE NOT EXISTS (
                SELECT 1 FROM AD_ZNTITEMCONF X 
                WHERE X.NUUNICO = V_NUUNICO 
                  -- Ajuste na validação para permitir nulos do TMS
                  AND NVL(X.CODPROD, 0) = CASE WHEN REGEXP_LIKE(D.CODPROD, '^[0-9]+$') THEN TO_NUMBER(D.CODPROD) ELSE 0 END 
                  AND X.CONFERIDO = 'S'
                  -- Adiciona checagem por DESCRPROD se CODPROD for nulo (para distinguir itens do TMS)
                  AND (X.CODPROD IS NOT NULL OR X.DESCRPROD = D.DESCRPROD)
            );

        END LOOP;
    END AFTER STATEMENT;
END;