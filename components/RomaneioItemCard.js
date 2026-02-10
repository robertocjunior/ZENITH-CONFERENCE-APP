// components/RomaneioItemCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from './common/AnimatedButton'; // Importação adicionada

const RomaneioItemCard = ({ item, onPress }) => { // Adicionado onPress
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const formatPeso = (val) => val ? `${val.toString().replace('.', ',')} kg` : '-';

    // Verifica se o item já foi conferido
    const isConferido = item.conferido === 'S';

    return (
        // Alterado de View para AnimatedButton
        <AnimatedButton 
            style={[styles.card, isConferido && styles.cardConferido]}
            onPress={() => onPress && onPress(item)}
            disabled={!onPress} // Desabilita o clique se não houver função (ex: não dono)
        >
            <View style={styles.mainRow}>
                {/* COLUNA DA ESQUERDA: Informações do Produto */}
                <View style={styles.infoContainer}>
                    <View style={styles.headerBadges}>
                        <Text style={styles.codeBadge}>{item.codigo_produto}</Text>
                        <Text style={styles.dunText}>DUN: {item.codigo_barras_4_digitos}</Text>
                        
                        {/* Badge extra se estiver conferido */}
                        {isConferido && (
                            <View style={styles.conferidoBadge}>
                                <Ionicons name="checkmark-circle" size={12} color={colors.white} />
                                <Text style={styles.conferidoText}>OK</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.description}>{item.descricao}</Text>
                    
                    <Text style={styles.eanText}>
                        EAN: <Text style={styles.eanValue}>{item.referencia}</Text>
                    </Text>
                </View>

                {/* COLUNA DA DIREITA: Destaque para Quantidade */}
                <View style={styles.qtyContainer}>
                    <Text style={styles.qtyLabel}>QTD</Text>
                    <Text style={styles.qtyValue}>{item.quantidade}</Text>
                    <Text style={styles.qtyUnit}>{item.unidade}</Text>
                </View>
            </View>

            {/* RODAPÉ: Peso Bruto */}
            <View style={[styles.footer, isConferido && styles.footerConferido]}>
                <View style={styles.weightBox}>
                    <Ionicons name="scale-outline" size={14} color={colors.textLight} />
                    <Text style={styles.weightText}>Peso Bruto: {formatPeso(item.peso_bruto)}</Text>
                </View>
            </View>
        </AnimatedButton>
    );
};

const getStyles = (colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: SIZES.radius,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    // Estilo para item conferido (Verde)
    cardConferido: {
        backgroundColor: colors.cardConferidoBackground,
        borderColor: colors.cardConferidoBorder,
    },
    mainRow: {
        flexDirection: 'row',
        padding: 12,
        gap: 10,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    codeBadge: {
        backgroundColor: colors.inputBackground,
        color: colors.text,
        fontSize: 11,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    dunText: {
        fontSize: 10,
        color: colors.textLight,
    },
    // Badge OK verde escuro
    conferidoBadge: {
        backgroundColor: colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
    },
    conferidoText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
        lineHeight: 20,
    },
    eanText: {
        fontSize: 12,
        color: colors.textLight,
    },
    eanValue: {
        color: colors.text,
        fontWeight: '600',
    },
    qtyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 15,
        borderRadius: 8,
        minWidth: 70,
    },
    qtyLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text,
        textTransform: 'uppercase',
    },
    qtyValue: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
        lineHeight: 30,
    },
    qtyUnit: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    footer: {
        backgroundColor: colors.background,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    // Ajuste da cor do footer quando conferido
    footerConferido: {
        backgroundColor: 'rgba(0,0,0,0.05)', // Escurece levemente o fundo verde
        borderTopColor: colors.cardConferidoBorder,
    },
    weightBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    weightText: {
        fontSize: 12,
        color: colors.textLight,
        fontWeight: '500',
    },
});

export default RomaneioItemCard;