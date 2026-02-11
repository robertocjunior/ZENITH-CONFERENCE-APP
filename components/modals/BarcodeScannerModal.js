// components/modals/BarcodeScannerModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Button, TouchableOpacity, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES } from '../../constants/theme';

const BarcodeScannerModal = ({ visible, onClose, onScanned }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false); // Reseta o estado ao abrir
            if (!permission?.granted) {
                requestPermission();
            }
        }
    }, [visible]);

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return;
        
        setScanned(true);
        Vibration.vibrate(); // Feedback tátil
        onScanned(data);
    };

    if (!visible) return null;

    if (!permission) {
        // Carregando permissões
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide" transparent={false}>
                <View style={[styles.container, styles.center]}>
                    <Text style={[styles.text, { color: colors.text, marginBottom: 20 }]}>
                        Precisamos de acesso à câmera para ler códigos.
                    </Text>
                    <Button onPress={requestPermission} title="Conceder Permissão" />
                    <Button onPress={onClose} title="Cancelar" color="red" />
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_e", "upc_a"],
                    }}
                />
                
                {/* Camada Visual (Overlay) */}
                <View style={styles.overlay}>
                    <View style={styles.topOverlay}>
                        <Text style={styles.scanText}>Aponte para o código de barras</Text>
                    </View>
                    
                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.scanArea}>
                            {/* Cantos da área de scan para efeito visual */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>
                    
                    <View style={styles.bottomOverlay}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.closeText}>Fechar</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
    },
    // Overlay Styles para criar o efeito de "Buraco" no meio
    overlay: {
        flex: 1,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    middleRow: {
        flexDirection: 'row',
        height: 250, // Altura da área de scan
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanArea: {
        width: 300, // Largura da área de scan
        backgroundColor: 'transparent',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    scanText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    closeText: {
        color: 'white',
        fontSize: 14,
    },
    // Estilos dos cantos
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#8BC74B', // Cor primária (Light Green)
        borderWidth: 4,
    },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});

export default BarcodeScannerModal;