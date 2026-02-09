CREATE OR REPLACE PROCEDURE "STP_FINALIZAR_CONF_ZNT" (
    P_CODUSU NUMBER,        -- Código do usuário logado
    P_IDSESSAO VARCHAR2,    -- Identificador da execução
    P_QTDLINHAS NUMBER,     -- Quantidade de registros selecionados
    P_MENSAGEM OUT VARCHAR2 -- Mensagem de retorno
) AS
    FIELD_NUUNICO    NUMBER;
    PARAM_DTFIMCONF  DATE;
    PARAM_OBSFIM     VARCHAR2(4000); 
    V_STATUS_ATUAL   CHAR(1);
BEGIN
    -- 1. Obtenção dos parâmetros da tela (Igual ao padrão NIC_STP_DEVLINTEL)
    PARAM_DTFIMCONF := ACT_DTA_PARAM(P_IDSESSAO, 'DTFIMCONF'); 
    PARAM_OBSFIM    := ACT_TXT_PARAM(P_IDSESSAO, 'OBSFIM'); 
    
    IF PARAM_DTFIMCONF IS NULL THEN
        PARAM_DTFIMCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        -- 2. Captura a Chave Primária
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 3. Validação de Status
        SELECT STATUS INTO V_STATUS_ATUAL 
        FROM AD_ZNTCONFCAB 
        WHERE NUUNICO = FIELD_NUUNICO;
        
        IF NVL(V_STATUS_ATUAL, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20104, 'Apenas conferências com status "Em Conferência" (E) podem ser finalizadas.');
        END IF;

        -- 4. Atualização direta do campo OBS com PARAM_OBSFIM (Sem tratamento de dados)
        UPDATE AD_ZNTCONFCAB
        SET STATUS    = 'C',
            CONFERIDO = 'S',
            DTFIMCONF = PARAM_DTFIMCONF,
            CODUSU    = P_CODUSU,
            OBS       = PARAM_OBSFIM
        WHERE NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Conferência finalizada com sucesso!';

END;