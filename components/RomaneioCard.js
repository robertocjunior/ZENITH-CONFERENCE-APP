// components/RomaneioCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import AnimatedButton from './common/AnimatedButton';

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
        peso // Novo campo adicionado
    } = item;

    // Formatação simples para trocar ponto por vírgula (ex: 2428.68 -> 2428,68 kg)
    const formatPeso = (val) => {
        if (val === undefined || val === null) return '- kg';
        return `${val.toString().replace('.', ',')} kg`;
    };

    return (
        <AnimatedButton 
            style={styles.card}
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

            {/* Footer: Placa, Peso e Paletes distribuídos */}
            <View style={styles.footer}>
                <Text style={styles.placaBadge}>{placa || 'S/ PLACA'}</Text>
                
                {/* Peso centralizado */}
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
    }
});

export default RomaneioCard; 