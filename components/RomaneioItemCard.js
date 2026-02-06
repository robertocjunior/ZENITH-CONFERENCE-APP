import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const RomaneioItemCard = ({ item }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const formatPeso = (val) => val ? `${val.toString().replace('.', ',')} kg` : '-';

    return (
        <View style={styles.card}>
            <View style={styles.mainRow}>
                {/* COLUNA DA ESQUERDA: Informações do Produto */}
                <View style={styles.infoContainer}>
                    <View style={styles.headerBadges}>
                        <Text style={styles.codeBadge}>{item.codigo_produto}</Text>
                        <Text style={styles.dunText}>DUN: {item.codigo_barras_4_digitos}</Text>
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
            <View style={styles.footer}>
                <View style={styles.weightBox}>
                    <Ionicons name="scale-outline" size={14} color={colors.textLight} />
                    <Text style={styles.weightText}>Peso Bruto: {formatPeso(item.peso_bruto)}</Text>
                </View>
            </View>
        </View>
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
    mainRow: {
        flexDirection: 'row',
        padding: 12,
        gap: 10,
    },
    // Estilos da Coluna de Informação
    infoContainer: {
        flex: 1, // Ocupa o espaço restante
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

    // Estilos da Coluna de Quantidade (Destaque)
    qtyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inputBackground, // Um fundo leve para destacar o bloco
        paddingHorizontal: 15,
        borderRadius: 8,
        minWidth: 70,
    },
    qtyLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textLight,
        textTransform: 'uppercase',
    },
    qtyValue: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text, // Usa a cor primária para chamar atenção
        lineHeight: 30,
    },
    qtyUnit: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },

    // Estilos do Rodapé
    footer: {
        backgroundColor: colors.background, // Fundo ligeiramente diferente
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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