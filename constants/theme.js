// constants/theme.js
import { Appearance } from 'react-native';

export const lightColors = {
    primary: '#8BC74B',
    secondary: '#145734',
    background: '#f0f2f5',
    cardBackground: '#ffffff',
    text: '#333333',
    iconLogin: 'null',
    textLight: '#777777',
    border: '#e0e0e0',
    inputBackground: '#ffffff',
    buttonSecondaryBackground: '#e0e0e0',
    white: '#ffffff',
    black: '#000000',
    headerIcon: '#ffffff',
    success: '#28a745',
    info: '#007bff',
    warning: '#ffc107',
    orange: '#fd7e14',
    danger: '#dc3545',
    
    pickingBackground: '#fffbe6',
    pickingBorder: '#ffe58f',
    
    correctionBackground: '#fff8e1',
    correctionBorder: '#ffecb3',
    correctionHeader: '#c09b00',
    
    // Status E (Romaneio em conferência) - Roxo/Lilás
    cardStatusEBackground: '#f3e5f5', 
    cardStatusEBorder: '#ce93d8',
    
    // Item Conferido (S) - Verde
    cardConferidoBackground: '#e8f5e9',
    cardConferidoBorder: '#a5d6a7',

    LoadingName: '#145734',
    danger_light: '#fde7e9',
    LoadingIcon: require('../assets/icons/loading.png'),
    logo512x512: require('../assets/icons/icon512x512.png'),
    logoName: require('../assets/icons/name.png'),
    Forklift: require('../assets/icons/forklift.png'),
};

export const darkColors = {
    primary: '#145734',
    secondary: '#8BC74B',
    background: '#121212',
    cardBackground: '#313131ff',
    text: '#f0f0f0',
    iconLogin: '#f0f0f0',
    textLight: '#a0a0a0',
    border: '#444444',
    inputBackground: '#333333',
    buttonSecondaryBackground: '#444444',
    white: '#ffffff',
    black: '#000000',
    headerIcon: '#f0f0f0',
    success: '#28a745',
    info: '#007bff',
    warning: '#ffc107',
    orange: '#fd7e14',
    danger: '#dc3545',
    
    pickingBackground: '#4d441f',
    pickingBorder: '#8c7b3f',
    
    correctionBackground: '#4d452d',
    correctionBorder: '#8c7e5a',
    correctionHeader: '#e0c466',
    
    // Status E (Dark)
    cardStatusEBackground: '#4d452d',
    cardStatusEBorder: '#8c7e5a',

    // Item Conferido (Dark)
    cardConferidoBackground: '#1b5e20',
    cardConferidoBorder: '#2e7d32',

    LoadingName: '#8BC74B',
    danger_light: '#4d2b30',
    LoadingIcon: require('../assets/icons/loading-dark.png'),
    logo512x512: require('../assets/icons/icon512x512-dark.png'),
    logoName: require('../assets/icons/name-dark.png'),
    Forklift: require('../assets/icons/forklift-dark.png'),
};

export const SIZES = {
    padding: 15,
    radius: 8,
    base: 8,
    font: 14,
    h1: 30,
    h2: 22,
    h3: 16,
    body: 14,
};