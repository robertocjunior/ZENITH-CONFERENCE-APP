CREATE OR REPLACE PROCEDURE "STP_CONFERIR_ITEM_ZNT" (
    P_CODUSU NUMBER,        -- Código do usuário logado
    P_IDSESSAO VARCHAR2,    -- Identificador da execução
    P_QTDLINHAS NUMBER,     -- Quantidade de registros selecionados
    P_MENSAGEM OUT VARCHAR2 -- Mensagem de retorno para o usuário
) AS
    FIELD_NUMREG NUMBER;
    FIELD_NUUNICO NUMBER;
    PARAM_DTHCONF DATE;
BEGIN
    -- 1. Obtenção do parâmetro de Data e Hora da tela (se houver um campo chamado DTHCONF na tela de parâmetros)
    -- Caso queira usar sempre a hora atual do sistema, use SYSDATE diretamente no UPDATE.
    PARAM_DTHCONF := ACT_DTA_PARAM(P_IDSESSAO, 'DTHCONF'); 
    
    -- Se o parâmetro vier vazio, assume a data/hora atual
    IF PARAM_DTHCONF IS NULL THEN
        PARAM_DTHCONF := SYSDATE;
    END IF;

    FOR I IN 1..P_QTDLINHAS LOOP
        -- 2. Captura a Chave Primária do registro selecionado (NUMREG e NUUNICO)
        FIELD_NUMREG  := ACT_INT_FIELD(P_IDSESSAO, I, 'NUMREG');
        FIELD_NUUNICO := ACT_INT_FIELD(P_IDSESSAO, I, 'NUUNICO');

        -- 3. Atualiza o registro
        -- A trigger de proteção que criamos antes impedirá se já estiver 'S', 
        -- mas aqui forçamos a atualização dos selecionados.
        UPDATE AD_ZNTITEMCONF
        SET CONFERIDO = 'S',
            DTHCONF   = PARAM_DTHCONF
        WHERE NUMREG  = FIELD_NUMREG
          AND NUUNICO = FIELD_NUUNICO;

    END LOOP;

    P_MENSAGEM := 'Itens conferidos com sucesso!';

END;