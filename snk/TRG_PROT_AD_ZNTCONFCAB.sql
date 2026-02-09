CREATE OR REPLACE TRIGGER TRG_PROT_AD_ZNTCONFCAB
BEFORE UPDATE OR DELETE ON AD_ZNTCONFCAB
FOR EACH ROW
BEGIN
    -- Impede qualquer exclusão
    IF DELETING THEN
        RAISE_APPLICATION_ERROR(-20001, 'Não é permitido excluir um cabeçalho de conferência.');
    END IF;

    -- Impede alteração se já estiver conferido
    IF UPDATING THEN
        IF :OLD.CONFERIDO = 'S' THEN
            -- Permite apenas que o status seja alterado de 'S' para 'N' (se necessário reabrir)
            -- Caso não queira permitir nem a reabertura, remova a condição do IF abaixo
            IF :NEW.CONFERIDO = 'S' OR :NEW.CONFERIDO IS NULL THEN
                 RAISE_APPLICATION_ERROR(-20002, 'Este fechamento já foi finalizado (Status S) e não pode ser alterado.');
            END IF;
        END IF;
    END IF;
END;