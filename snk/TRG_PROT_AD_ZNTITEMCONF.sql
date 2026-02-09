CREATE OR REPLACE TRIGGER TRG_PROT_AD_ZNTITEMCONF
BEFORE UPDATE OR DELETE ON AD_ZNTITEMCONF
FOR EACH ROW
DECLARE
    V_CONFERIDO_CAB VARCHAR2(1);
BEGIN
    -- Permite o DELETE apenas se o item não estiver conferido
    IF DELETING THEN
        IF :OLD.CONFERIDO = 'S' THEN
            RAISE_APPLICATION_ERROR(-20003, 'Não é permitido excluir itens já conferidos.');
        END IF;
    END IF;

    IF UPDATING THEN
        -- Bloqueia se o item já estiver conferido
        IF :OLD.CONFERIDO = 'S' THEN
            RAISE_APPLICATION_ERROR(-20004, 'Este item já foi conferido e não permite mais alterações.');
        END IF;

        -- Bloqueia se o CABEÇALHO já estiver conferido (S)
        BEGIN
            SELECT CONFERIDO INTO V_CONFERIDO_CAB
            FROM AD_ZNTCONFCAB
            WHERE NUUNICO = :OLD.NUUNICO;
            
            IF NVL(V_CONFERIDO_CAB, 'N') = 'S' THEN
                RAISE_APPLICATION_ERROR(-20005, 'O cabeçalho deste grupo já está finalizado.');
            END IF;
        EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
        END;
    END IF;
END;