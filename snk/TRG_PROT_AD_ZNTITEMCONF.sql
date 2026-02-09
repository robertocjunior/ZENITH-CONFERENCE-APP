CREATE OR REPLACE TRIGGER TRG_PROT_AD_ZNTITEMCONF
BEFORE UPDATE OR DELETE ON AD_ZNTITEMCONF
FOR EACH ROW
BEGIN
    -- Impede qualquer exclusão de item
    IF DELETING THEN
        RAISE_APPLICATION_ERROR(-20003, 'Não é permitido excluir itens de conferência. Eles são sincronizados automaticamente.');
    END IF;

    -- Impede alteração se o item já estiver marcado como conferido
    IF UPDATING THEN
        IF :OLD.CONFERIDO = 'S' THEN
            RAISE_APPLICATION_ERROR(-20004, 'Este item já foi conferido e não permite mais alterações.');
        END IF;
    END IF;
END;