import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SIZES } from '../constants/theme';
import AnimatedButton from './common/AnimatedButton';

const RomaneioCard = ({ item }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <AnimatedButton style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
                <Text style={styles.textLight}>Fechamento: <Text style={styles.bold}>{item.fechamento}</Text></Text>
                <Text style={styles.textLight}>{item.data}</Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.motorista}>{item.motorista}</Text>
                <Text style={styles.veiculo}>{item.veiculo}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.placa}>{item.placa}</Text>
                <Text style={styles.textLight}>Paletes: <Text style={styles.bold}>{item.paletes}</Text></Text>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    body: {
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    motorista: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    veiculo: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 2,
    },
    placa: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
    },
    textLight: {
        color: colors.textLight,
        fontSize: 13,
    },
    bold: {
        fontWeight: 'bold',
        color: colors.text,
    },
});

export default RomaneioCard;