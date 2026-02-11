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
BEGIN
    -- 1. Obtenção dos parâmetros da tela (Dialog)
    PARAM_DTHCONF      := ACT_DTA_PARAM(P_IDSESSAO, 'DTHCONF'); 
    PARAM_QTDEMBARCADA := ACT_DEC_PARAM(P_IDSESSAO, 'QTDEMBARCADA');
    PARAM_OBS          := ACT_TXT_PARAM(P_IDSESSAO, 'OBS');
    
    -- Tratamento básico para a data
    IF PARAM_DTHCONF IS NULL THEN
        PARAM_DTHCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        -- 2. Captura a Chave Primária do registro selecionado na grade
        FIELD_NUMREG  := ACT_INT_FIELD(P_IDSESSAO, I, 'NUMREG');
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 3. Validação: Verifica se o item já está conferido
        SELECT CONFERIDO INTO V_JA_CONFERIDO
        FROM AD_ZNTITEMCONF
        WHERE NUMREG = FIELD_NUMREG AND NUUNICO = FIELD_NUUNICO;

        IF NVL(V_JA_CONFERIDO, 'N') = 'S' THEN
            RAISE_APPLICATION_ERROR(-20102, 'O item ' || FIELD_NUMREG || ' já está conferido e não pode ser processado novamente.');
        END IF;

        -- 4. Validação do Cabeçalho (Status e Usuário Permissivo)
        SELECT STATUS, CODUSU INTO V_STATUS_CAB, V_USUARIO_CAB
        FROM AD_ZNTCONFCAB
        WHERE NUUNICO = FIELD_NUUNICO;

        -- 4.1 Validação de Usuário
        IF NVL(V_USUARIO_CAB, 0) <> P_CODUSU THEN
            RAISE_APPLICATION_ERROR(-20103, 'Ação negada: Você não é o usuário responsável por esta conferência.');
        END IF;

        -- 4.2 Validação do Status (Deve ser 'E')
        IF NVL(V_STATUS_CAB, ' ') <> 'E' THEN
            RAISE_APPLICATION_ERROR(-20101, 'O item não pode ser conferido pois o status do fechamento não é "Em Conferência" (E).');
        END IF;

        -- 5. Atualiza o registro do item com os parâmetros obtidos
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