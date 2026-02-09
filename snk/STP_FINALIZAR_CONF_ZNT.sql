CREATE OR REPLACE PROCEDURE "STP_FINALIZAR_CONF_ZNT" (
    P_CODUSU NUMBER,        -- Código do usuário logado
    P_IDSESSAO VARCHAR2,    -- Identificador da execução
    P_QTDLINHAS NUMBER,     -- Quantidade de registros selecionados
    P_MENSAGEM OUT VARCHAR2 -- Mensagem de retorno
) AS
    FIELD_NUUNICO NUMBER;
    PARAM_DTFIMCONF DATE;
    V_STATUS_ATUAL CHAR(1);
BEGIN
    -- 1. Obtenção do parâmetro de Data e Hora de Término
    PARAM_DTFIMCONF := ACT_DTA_PARAM(P_IDSESSAO, 'DTFIMCONF'); 
    
    IF PARAM_DTFIMCONF IS NULL THEN
        PARAM_DTFIMCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        -- 2. Captura a Chave Primária do cabeçalho
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 3. Validação de Status: Só pode finalizar o que está "Em Conferência" (E)
        SELECT STATUS INTO V_STATUS_ATUAL 
        FROM AD_ZNTCONFCAB 
        WHERE NUUNICO = FIELD_NUUNICO;
        
        IF NVL(V_STATUS_ATUAL, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20104, 'Apenas conferências com status "Em Conferência" (E) podem ser finalizadas.');
        END IF;

        -- 4. Atualiza o cabeçalho para Finalizado (Status C)
        UPDATE AD_ZNTCONFCAB
        SET STATUS    = 'C',
            CONFERIDO = 'S',
            DTFIMCONF = PARAM_DTFIMCONF,
            CODUSU    = P_CODUSU
        WHERE NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Conferência finalizada com sucesso (mesmo com itens pendentes).';

END;