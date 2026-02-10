// screens/RomaneioDetailsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { fetchRomaneioDetails, startConferencia } from '../api';
import RomaneioItemCard from '../components/RomaneioItemCard';
import AnimatedButton from '../components/common/AnimatedButton';
import ConfirmationModal from '../components/modals/ConfirmationModal'; // IMPORTADO
import * as SystemUI from 'expo-system-ui';
import { useFocusEffect } from '@react-navigation/native';

const RomaneioDetailsScreen = ({ route, navigation }) => {
    const { colors } = useTheme();
    const { userSession } = useAuth();
    const styles = getStyles(colors);
    const { romaneioId } = route.params;

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Novo estado para controlar o modal
    const [isConfirmVisible, setConfirmVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            SystemUI.setBackgroundColorAsync(colors.background);
        }, [colors])
    );

    useEffect(() => {
        loadDetails();
    }, [romaneioId]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const data = await fetchRomaneioDetails(romaneioId);
            setDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 1. Apenas abre o modal
    const handleStartConferencePress = () => {
        setConfirmVisible(true);
    };

    // 2. Ação real executada ao confirmar no modal
    const confirmStartConference = async () => {
        try {
            setActionLoading(true); // O modal vai usar isso para mostrar "Aguarde..."
            await startConferencia(details.nu_unico);
            setConfirmVisible(false); // Fecha o modal
            await loadDetails(); // Recarrega a tela
        } catch (e) {
            setConfirmVisible(false);
            Alert.alert('Erro', e.message || 'Não foi possível iniciar a conferência.');
        } finally {
            setActionLoading(false);
        }
    };

    const formatPeso = (val) => val ? `${val.toString().replace('.', ',')} kg` : '-';

    if (loading && !details) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !details) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={{ color: colors.text }}>Erro ao carregar detalhes: {error}</Text>
                <AnimatedButton onPress={loadDetails} style={styles.retryButton}>
                    <Text style={styles.retryText}>Tentar Novamente</Text>
                </AnimatedButton>
            </View>
        );
    }

    const todosItens = details.produtos || [];
    const itensConferidos = todosItens.filter(p => p.conferido === 'S');
    const itensPendentes = todosItens.filter(p => p.conferido !== 'S');
    const pendentesProprias = itensPendentes.filter(p => p.tipo === 'O');
    const pendentesTerceiros = itensPendentes.filter(p => p.tipo !== 'O');

    const isStatusD = details.status_conf === 'D';
    const isStatusE = details.status_conf === 'E';
      ''
    const isOwner = userSession?.codusu && details.cod_usuario === userSession.codusu;
    const shouldShowHeader = !isStatusE || (isStatusE && !isOwner);

    return (
        <View style={styles.container}>
            {/* Modal de Confirmação */}
            <ConfirmationModal
                visible={isConfirmVisible}
                title="Iniciar Conferência"
                message="Deseja realmente iniciar a conferência deste romaneio?"
                onClose={() => setConfirmVisible(false)}
                onConfirm={confirmStartConference}
                isLoading={actionLoading}
                confirmText="Iniciar"
            />

            <View style={styles.navHeader}>
                <AnimatedButton onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </AnimatedButton>
                <Text style={styles.navTitle}>Detalhes do Romaneio</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {shouldShowHeader && (
                    <View style={[styles.summaryCard, isStatusE && styles.summaryCardStatusE]}>
                        <View style={styles.summaryRow}>
                            <View>
                                <Text style={styles.label}>ROMANEIO</Text>
                                <Text style={styles.romaneioBig}>#{details.fechamento}</Text>
                            </View>
                            <View style={styles.dateBadge}>
                                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                                <Text style={styles.dateText}>{details.data}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="person" size={16} color={colors.textLight} />
                            <Text style={styles.infoText}>{details.motorista}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="bus" size={16} color={colors.textLight} />
                            <Text style={styles.infoText}>{details.veiculo}</Text>
                        </View>

                        {isStatusE && (
                            <View style={styles.userInfoContainer}>
                                <View style={styles.userBadge}>
                                    <Ionicons name="person" size={12} color={colors.white} />
                                    <Text style={styles.userBadgeText}>EM CONFERÊNCIA</Text>
                                </View>
                                <Text style={styles.userNameText} numberOfLines={1}>
                                    <Text style={styles.bold}>{details.cod_usuario}</Text> - {details.nome_usuario}
                                </Text>
                            </View>
                        )}

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>PLACA</Text>
                                <Text style={styles.statValue}>{details.placa}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>PESO TOTAL</Text>
                                <Text style={styles.statValue}>{formatPeso(details.peso)}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>PALETES</Text>
                                <Text style={styles.statValue}>{details.paletes}</Text>
                            </View>
                        </View>

                        {/* Botão Modificado */}
                        {isStatusD && (
                            <AnimatedButton 
                                style={styles.startButton} 
                                onPress={handleStartConferencePress} // Abre o modal
                            >
                                <Ionicons name="play-circle-outline" size={24} color={colors.white} />
                                <Text style={styles.startButtonText}>INICIAR CONFERÊNCIA</Text>
                            </AnimatedButton>
                        )}
                    </View>
                )}

                {/* Listas de Itens (sem alterações) */}
                {pendentesProprias.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas Próprias</Text>
                        {pendentesProprias.map((item, index) => (
                            <RomaneioItemCard key={`propria-${index}`} item={item} />
                        ))}
                    </View>
                )}

                {pendentesTerceiros.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas de Terceiros</Text>
                        {pendentesTerceiros.map((item, index) => (
                            <RomaneioItemCard key={`terceiro-${index}`} item={item} />
                        ))}
                    </View>
                )}

                {itensConferidos.length > 0 && (
                    <View style={styles.conferidosWrapper}>
                        <View style={styles.conferidosBar}>
                            <View style={styles.barLine} />
                            <View style={styles.barBadge}>
                                <Ionicons name="checkmark-done-circle" size={18} color={colors.white} />
                                <Text style={styles.barText}>JÁ CONFERIDOS</Text>
                            </View>
                            <View style={styles.barLine} />
                        </View>

                        <View style={styles.section}>
                            {itensConferidos.map((item, index) => (
                                <RomaneioItemCard key={`conferido-${index}`} item={item} />
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    navHeader: {
        backgroundColor: colors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    navTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    scrollContent: {
        padding: 15,
    },
    summaryCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryCardStatusE: {
        backgroundColor: colors.cardStatusEBackground,
        borderColor: colors.cardStatusEBorder,
        borderWidth: 1.5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 10,
        color: colors.textLight,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    romaneioBig: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.text,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        padding: 8,
        borderRadius: 8,
        gap: 6,
    },
    dateText: {
        fontWeight: 'bold',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    userInfoContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userBadge: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 5,
    },
    userBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    userNameText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
    },
    bold: {
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        backgroundColor: colors.inputBackground,
        padding: 15,
        borderRadius: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: colors.textLight,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    startButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        gap: 10,
        elevation: 2,
    },
    startButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        paddingLeft: 5,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 8,
    },
    retryText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    conferidosWrapper: {
        marginTop: 10,
    },
    conferidosBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    barLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.success,
        opacity: 0.5,
    },
    barBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
    },
    barText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default RomaneioDetailsScreen;