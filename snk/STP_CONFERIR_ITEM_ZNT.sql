CREATE OR REPLACE PROCEDURE "STP_CONFERIR_ITEM_ZNT" (
    P_CODUSU NUMBER,        -- Código do usuário logado
    P_IDSESSAO VARCHAR2,    -- Identificador da execução
    P_QTDLINHAS NUMBER,     -- Quantidade de registros selecionados
    P_MENSAGEM OUT VARCHAR2 -- Mensagem de retorno para o usuário
) AS
    FIELD_NUMREG NUMBER;
    FIELD_NUUNICO NUMBER;
    PARAM_DTHCONF DATE;
    V_STATUS_CAB CHAR(1);
    V_JA_CONFERIDO VARCHAR2(1);
BEGIN
    -- 1. Obtenção do parâmetro de Data e Hora da tela
    PARAM_DTHCONF := ACT_DTA_PARAM(P_IDSESSAO, 'DTHCONF'); 
    
    IF PARAM_DTHCONF IS NULL THEN
        PARAM_DTHCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        -- 2. Captura a Chave Primária do registro selecionado
        FIELD_NUMREG  := ACT_INT_FIELD(P_IDSESSAO, I, 'NUMREG');
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 3. Validação: Verifica se o item já está conferido
        SELECT CONFERIDO INTO V_JA_CONFERIDO
        FROM AD_ZNTITEMCONF
        WHERE NUMREG = FIELD_NUMREG AND NUUNICO = FIELD_NUUNICO;

        IF NVL(V_JA_CONFERIDO, 'N') = 'S' THEN
            RAISE_APPLICATION_ERROR(-20102, 'O item ' || FIELD_NUMREG || ' já está conferido e não pode ser processado novamente.');
        END IF;

        -- 4. Validação do Status do Cabeçalho (Deve ser 'E')
        SELECT STATUS INTO V_STATUS_CAB
        FROM AD_ZNTCONFCAB
        WHERE NUUNICO = FIELD_NUUNICO;

        IF NVL(V_STATUS_CAB, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20101, 'O item não pode ser conferido pois o status do fechamento não é "Em Conferência" (E).');
        END IF;

        -- 5. Atualiza o registro do item
        UPDATE AD_ZNTITEMCONF
        SET CONFERIDO = 'S',
            DTHCONF   = PARAM_DTHCONF,
            CODUSU    = P_CODUSU
        WHERE NUMREG  = FIELD_NUMREG
          AND NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Itens conferidos com sucesso!';

END;