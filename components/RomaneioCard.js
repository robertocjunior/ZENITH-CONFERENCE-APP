// components/RomaneioCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import AnimatedButton from './common/AnimatedButton';
import { Ionicons } from '@expo/vector-icons';

const RomaneioCard = ({ item, onPress }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Proteção caso o item venha nulo
    if (!item) return null;

    const { 
        fechamento,
        data,
        motorista,
        placa,
        veiculo,
        paletes,
        peso,
        status,         // Novo campo
        cod_usuario,    // Novo campo
        nome_usuario    // Novo campo
    } = item;

    const formatPeso = (val) => {
        if (val === undefined || val === null) return '- kg';
        return `${val.toString().replace('.', ',')} kg`;
    };

    // Verifica se é o status especial
    const isStatusE = status === 'E';

    return (
        <AnimatedButton 
            style={[styles.card, isStatusE && styles.cardStatusE]}
            onPress={() => onPress && onPress(item)}
        >
            {/* Header: Data e Veículo */}
            <View style={styles.header}>
                <Text style={styles.textLight}>Data: <Text style={styles.bold}>{data}</Text></Text>
                <Text style={[styles.textLight, { maxWidth: '50%' }]} numberOfLines={1}>
                    {veiculo}
                </Text>
            </View>

            {/* Body: Destaque para o Fechamento e Motorista */}
            <View style={styles.body}>
                <Text style={styles.romaneioMain}>{fechamento}</Text>
                <Text style={styles.motoristaSub} numberOfLines={1}>
                    {motorista}
                </Text>
            </View>

            {/* SEÇÃO EXTRA: Informações do Usuário (Apenas se Status E) */}
            {isStatusE && (
                <View style={styles.userInfoContainer}>
                    <View style={styles.userBadge}>
                        <Ionicons name="person" size={12} color={colors.white} />
                        <Text style={styles.userBadgeText}>EM CONFERÊNCIA</Text>
                    </View>
                    <Text style={styles.userNameText} numberOfLines={1}>
                        <Text style={styles.bold}>{cod_usuario}</Text> - {nome_usuario}
                    </Text>
                </View>
            )}

            {/* Footer: Placa, Peso e Paletes */}
            <View style={styles.footer}>
                <Text style={styles.placaBadge}>{placa || 'S/ PLACA'}</Text>
                <Text style={styles.textLight}>Peso: <Text style={styles.bold}>{formatPeso(peso)}</Text></Text>
                <Text style={styles.textLight}>Paletes: <Text style={styles.bold}>{paletes}</Text></Text>
            </View>
        </AnimatedButton>
    );
};

const getStyles = (colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'stretch',
    },
    // Estilo condicional para Status E
    cardStatusE: {
        backgroundColor: colors.cardStatusEBackground,
        borderColor: colors.cardStatusEBorder,
        borderWidth: 1.5, // Borda um pouco mais grossa para destaque
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    body: {
        marginBottom: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textLight: {
        color: colors.textLight,
        fontSize: 13,
    },
    bold: {
        fontWeight: 'bold',
        color: colors.text
    },
    romaneioMain: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    motoristaSub: {
        fontSize: 14,
        color: colors.textLight,
    },
    placaBadge: {
        backgroundColor: colors.inputBackground,
        color: colors.textLight,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 12,
        overflow: 'hidden',
        fontWeight: 'bold',
    },
    // Estilos da nova seção de usuário
    userInfoContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)', // Fundo sutil
        padding: 8,
        borderRadius: 6,
        marginBottom: 15, // Espaço antes do footer
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userBadge: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    userBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    userNameText: {
        flex: 1,
        fontSize: 13,
        color: colors.text,
    }
});

export default RomaneioCard;