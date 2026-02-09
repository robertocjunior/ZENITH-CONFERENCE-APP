CREATE OR REPLACE PROCEDURE "STP_INICIAR_CONF_ZNT" (
    P_CODUSU NUMBER,        
    P_IDSESSAO VARCHAR2,    
    P_QTDLINHAS NUMBER,     
    P_MENSAGEM OUT VARCHAR2 
) AS
    FIELD_NUUNICO NUMBER;
    PARAM_DTINICONF DATE;
    V_CONFERIDO VARCHAR2(1);
    V_STATUS CHAR(1);
BEGIN
    PARAM_DTINICONF := ACT_DTA_PARAM(P_IDSESSAO, 'DTINICONF'); 
    
    IF PARAM_DTINICONF IS NULL THEN
        PARAM_DTINICONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 1. Busca status atual para validação
        SELECT CONFERIDO, STATUS 
          INTO V_CONFERIDO, V_STATUS
          FROM AD_ZNTCONFCAB
         WHERE NUUNICO = FIELD_NUUNICO;

        -- 2. Validação: Se Finalizado (S) e Status diferente de 'D', bloqueia.
        -- Isso impede reiniciar algo que já passou do status inicial "Aguardando".
        IF NVL(V_CONFERIDO, 'N') = 'S' OR NVL(V_STATUS, 'D') <> 'D' THEN
            RAISE_APPLICATION_ERROR(-20105, 'Não é possível iniciar: o fechamento já foi finalizado ou já está fora do status inicial (Aguardando).');
        END IF;

        -- 3. Atualiza o cabeçalho
        UPDATE AD_ZNTCONFCAB
        SET STATUS    = 'E',
            CODUSU    = P_CODUSU,
            DTINICONF = PARAM_DTINICONF
        WHERE NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Conferência iniciada com sucesso!';

END;