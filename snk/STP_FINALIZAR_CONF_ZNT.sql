CREATE OR REPLACE PROCEDURE "STP_FINALIZAR_CONF_ZNT" (
    P_CODUSU NUMBER,        
    P_IDSESSAO VARCHAR2,    
    P_QTDLINHAS NUMBER,     
    P_MENSAGEM OUT VARCHAR2 
) AS
    FIELD_NUUNICO NUMBER;
    PARAM_DTFIMCONF DATE;
    PARAM_OBS VARCHAR2(4000); 
    V_STATUS_ATUAL CHAR(1);
BEGIN
    -- 1. Captura dos parâmetros
    PARAM_DTFIMCONF := ACT_DTA_PARAM(P_IDSESSAO, 'DTFIMCONF'); 
    
    -- Usando o nome exatamente como na imagem: OBS
    PARAM_OBS := ACT_TXT_PARAM(P_IDSESSAO, 'OBS'); 
    
    IF PARAM_DTFIMCONF IS NULL THEN
        PARAM_DTFIMCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        SELECT STATUS INTO V_STATUS_ATUAL 
        FROM AD_ZNTCONFCAB 
        WHERE NUUNICO = FIELD_NUUNICO;
        
        IF NVL(V_STATUS_ATUAL, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20104, 'Apenas conferências com status "Em Conferência" (E) podem ser finalizadas.');
        END IF;

        -- 2. Update com tratamento para o texto
        UPDATE AD_ZNTCONFCAB
        SET STATUS    = 'C',
            CONFERIDO = 'S',
            DTFIMCONF = PARAM_DTFIMCONF,
            CODUSU    = P_CODUSU,
            OBS       = SUBSTR(TRIM(PARAM_OBS), 1, 4000) -- Garante a limpeza e o limite de caracteres
        WHERE NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Conferência finalizada! Obs registrada: ' || NVL(PARAM_OBS, '(Vazio)');

END;