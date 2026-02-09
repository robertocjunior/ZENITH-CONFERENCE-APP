CREATE OR REPLACE TRIGGER TRG_PROT_AD_ZNTITEMCONF
BEFORE UPDATE OR DELETE ON AD_ZNTITEMCONF
FOR EACH ROW
DECLARE
    V_CONFERIDO_CAB VARCHAR2(1);
BEGIN
    -- 1. Impede qualquer exclusão de item
    IF DELETING THEN
        RAISE_APPLICATION_ERROR(-20003, 'Não é permitido excluir itens de conferência. Eles são sincronizados automaticamente.');
    END IF;

    -- 2. Regras para Atualização
    IF UPDATING THEN
        -- Validação A: Impede alteração se o item individual já estiver conferido
        IF :OLD.CONFERIDO = 'S' THEN
            RAISE_APPLICATION_ERROR(-20004, 'Este item já foi conferido individualmente e não permite mais alterações.');
        END IF;

        -- Validação B: Busca o status do cabeçalho
        BEGIN
            SELECT CONFERIDO INTO V_CONFERIDO_CAB
            FROM AD_ZNTCONFCAB
            WHERE NUUNICO = :OLD.NUUNICO;
            
            IF NVL(V_CONFERIDO_CAB, 'N') = 'S' THEN
                RAISE_APPLICATION_ERROR(-20005, 'Este fechamento já foi finalizado no cabeçalho. Não é possível alterar nenhum item deste grupo.');
            END IF;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                NULL; -- Se o cabeçalho não existir, permite prosseguir (evita travamento)
        END;
    END IF;
END;
/