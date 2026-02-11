CREATE OR REPLACE PROCEDURE NICOTST."STP_CONFERIR_ITEM_ZNT" (
    P_CODUSU NUMBER,        -- Código do usuário logado
    P_IDSESSAO VARCHAR2,    -- Identificador da execução
    P_QTDLINHAS NUMBER,     -- Quantidade de registros selecionados
    P_MENSAGEM OUT VARCHAR2 -- Mensagem de retorno para o usuário
) AS
    FIELD_NUMREG NUMBER;
    FIELD_NUUNICO NUMBER;
    
    -- Variáveis para os Parâmetros da Tela
    PARAM_DTHCONF DATE;
    PARAM_QTDEMBARCADA NUMBER;
    PARAM_OBS VARCHAR2(4000);
    
    V_STATUS_CAB CHAR(1);
    V_USUARIO_CAB NUMBER;
    V_JA_CONFERIDO VARCHAR2(1);
    V_QUANT_MAX NUMBER; -- Variável para validar o limite
BEGIN
    -- 1. Obtenção dos parâmetros da tela (Dialog)
    PARAM_DTHCONF      := ACT_DTA_PARAM(P_IDSESSAO, 'DTHCONF'); 
    PARAM_QTDEMBARCADA := ACT_DEC_PARAM(P_IDSESSAO, 'QTDEMBARCADA');
    PARAM_OBS          := ACT_TXT_PARAM(P_IDSESSAO, 'OBS');
    
    IF PARAM_DTHCONF IS NULL THEN
        PARAM_DTHCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        -- 2. Captura a Chave Primária
        FIELD_NUMREG  := ACT_INT_FIELD(P_IDSESSAO, I, 'NUMREG');
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 3. Busca dados do item para validação (Conferido e Quantidade Máxima)
        SELECT CONFERIDO, NVL(QUANT, 0) 
          INTO V_JA_CONFERIDO, V_QUANT_MAX
        FROM AD_ZNTITEMCONF
        WHERE NUMREG = FIELD_NUMREG AND NUUNICO = FIELD_NUUNICO;

        -- 3.1 Validação: Já conferido
        IF NVL(V_JA_CONFERIDO, 'N') = 'S' THEN
            RAISE_APPLICATION_ERROR(-20102, 'O item ' || FIELD_NUMREG || ' já está conferido.');
        END IF;

        -- 3.2 Validação: Quantidade Embarcada vs Quantidade do Registro
        IF PARAM_QTDEMBARCADA > V_QUANT_MAX THEN
            RAISE_APPLICATION_ERROR(-20104, 'Qtd. Embarcada (' || PARAM_QTDEMBARCADA || ') não pode ser maior que a Qtd. do registro (' || V_QUANT_MAX || ') para o item ' || FIELD_NUMREG || '.');
        END IF;

        -- 4. Validação do Cabeçalho
        SELECT STATUS, CODUSU INTO V_STATUS_CAB, V_USUARIO_CAB
        FROM AD_ZNTCONFCAB
        WHERE NUUNICO = FIELD_NUUNICO;

        IF NVL(V_USUARIO_CAB, 0) <> P_CODUSU THEN
            RAISE_APPLICATION_ERROR(-20103, 'Ação negada: Você não é o usuário responsável.');
        END IF;

        IF NVL(V_STATUS_CAB, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20101, 'Status do fechamento não é "Em Conferência" (E).');
        END IF;

        -- 5. Atualiza o registro do item
        UPDATE AD_ZNTITEMCONF
        SET CONFERIDO    = 'S',
            DTHCONF      = PARAM_DTHCONF,
            CODUSU       = P_CODUSU,
            QTDEMBARCADA = PARAM_QTDEMBARCADA,
            OBS          = PARAM_OBS
        WHERE NUMREG     = FIELD_NUMREG
          AND NUUNICO    = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Itens conferidos com sucesso!';

END;