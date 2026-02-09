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

        -- 3. Validação do Status do Cabeçalho
        SELECT STATUS INTO V_STATUS_CAB
        FROM AD_ZNTCONFCAB
        WHERE NUUNICO = FIELD_NUUNICO;

        IF NVL(V_STATUS_CAB, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20101, 'O item não pode ser conferido pois o status do fechamento não é "Em Conferência" (E). Verifique o cabeçalho.');
        END IF;

        -- 4. Atualiza o registro do item
        UPDATE AD_ZNTITEMCONF
        SET CONFERIDO = 'S',
            DTHCONF   = PARAM_DTHCONF,
            CODUSU    = P_CODUSU
        WHERE NUMREG  = FIELD_NUMREG
          AND NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Itens conferidos com sucesso!';

END;
/