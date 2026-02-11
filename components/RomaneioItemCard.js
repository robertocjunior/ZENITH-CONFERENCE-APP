// components/RomaneioItemCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AnimatedButton from './common/AnimatedButton';

const RomaneioItemCard = ({ item, onPress, isAllConferred, suppressDoneStyle }) => { 
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const formatPeso = (val) => val ? `${val.toString().replace('.', ',')} kg` : '-';

    // Verifica se o item já foi conferido
    const isConferido = item.conferido === 'S';

    // Definições de cores dinâmicas baseadas no estado isAllConferred
    const textColor = isAllConferred ? colors.white : colors.text;
    const labelColor = isAllConferred ? 'rgba(255,255,255,0.8)' : colors.textLight;
    const iconColor = isAllConferred ? colors.white : colors.textLight;
    const checkIconColor = isAllConferred ? colors.success : colors.white; // Inverte cor do check no badge se o fundo for verde
    const badgeBgColor = isAllConferred ? colors.white : colors.success; // Inverte fundo do badge se o fundo for verde

    return (
        <AnimatedButton 
            style={[
                styles.card, 
                // Estilo normal de conferido (Verde claro) - só aplica se NÃO estiver tudo conferido
                (isConferido && !suppressDoneStyle && !isAllConferred) && styles.cardConferido,
                // Estilo "Sucesso Total" (Verde Sólido igual ao cabeçalho)
                isAllConferred && styles.cardSuccess
            ]}
            onPress={() => onPress && onPress(item)}
            disabled={!isAllConferred && !onPress} 
        >
            <View style={styles.mainRow}>
                {/* COLUNA DA ESQUERDA: Informações do Produto */}
                <View style={styles.infoContainer}>
                    <View style={styles.headerBadges}>
                        <Text style={styles.codeBadge}>{item.codigo_produto}</Text>
                        <Text style={[styles.dunText, { color: labelColor }]}>DUN: {item.codigo_barras_4_digitos}</Text>
                        
                        {/* Badge extra se estiver conferido */}
                        {isConferido && (
                            <View style={[styles.conferidoBadge, isAllConferred && { backgroundColor: badgeBgColor }]}>
                                <Ionicons name="checkmark-circle" size={12} color={checkIconColor} />
                                <Text style={[styles.conferidoText, isAllConferred && { color: colors.success }]}>OK</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.description, { color: textColor }]}>{item.descricao}</Text>
                    
                    <Text style={[styles.eanText, { color: labelColor }]}>
                        EAN: <Text style={[styles.eanValue, { color: textColor }]}>{item.referencia}</Text>
                    </Text>
                </View>

                {/* COLUNA DA DIREITA: Destaque para Quantidade */}
                <View style={[styles.qtyContainer, isAllConferred && styles.qtyContainerSuccess]}>
                    <Text style={[styles.qtyLabel, isAllConferred && { color: colors.success }]}>QTD</Text>
                    <Text style={[styles.qtyValue, isAllConferred && { color: colors.success }]}>{item.quantidade}</Text>
                    <Text style={[styles.qtyUnit, isAllConferred && { color: colors.success }]}>{item.unidade}</Text>
                </View>
            </View>

            {/* RODAPÉ: Peso Bruto */}
            <View style={[
                styles.footer, 
                (isConferido && !suppressDoneStyle) && styles.footerConferido,
                isAllConferred && styles.footerSuccess
            ]}>
                <View style={styles.weightBox}>
                    <Ionicons name="scale-outline" size={14} color={iconColor} />
                    <Text style={[styles.weightText, { color: labelColor }]}>Peso Bruto: {formatPeso(item.peso_bruto)}</Text>
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
    cardConferido: {
        backgroundColor: colors.cardConferidoBackground,
        borderColor: colors.cardConferidoBorder,
    },
    // NOVO ESTILO: Igual ao cabeçalho (Verde Sólido)
    cardSuccess: {
        backgroundColor: colors.success,
        borderColor: colors.success,
        borderWidth: 1.5,
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
        color: colors.text, // Mantém contraste com o fundo branco do badge
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
    // Quando o card é verde (sucesso), o container de qtd fica branco para contraste
    qtyContainerSuccess: {
        backgroundColor: colors.white, 
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
    footerConferido: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderTopColor: colors.cardConferidoBorder,
    },
    // Rodapé mais escuro/transparente para combinar com o verde sólido
    footerSuccess: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderTopColor: 'rgba(255,255,255,0.2)',
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