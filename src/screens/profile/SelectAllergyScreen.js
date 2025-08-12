import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon, XMarkIcon } from 'react-native-heroicons/outline';

const API_BASE_URL = 'http://43.200.200.161:8080';

const ALLERGY_BIT_MAP = {
  '돼지고기': 1, '쇠고기': 2, '닭고기': 4, '고등어': 8, '게': 16, '새우': 32, '오징어': 64, '조개류': 128,
  '대두': 256, '땅콩': 512, '메밀': 1024, '밀': 2048, '잣': 4096, '호두': 8192, '복숭아': 16384,
  '토마토': 32768, '난류': 65536, '우유': 131072, '아황산': 262144
};
const ALL_ALLERGIES = Object.keys(ALLERGY_BIT_MAP);

const getBitsFromBannedList = (bannedList) => {
  let bits = 0;
  for (const name of bannedList) {
    if (ALLERGY_BIT_MAP[name]) {
      bits |= ALLERGY_BIT_MAP[name];
    }
  }
  return bits;
};

export default function SelectAllergyScreen({ route, navigation }) {
  const { userData } = route.params || {};
  const [selectedAllergies, setSelectedAllergies] = useState(userData.bannedList || []);
  const [search, setSearch] = useState('');

  const filteredAllergies = ALL_ALLERGIES.filter(item => item.includes(search));

  const toggleAllergy = (item) => {
    if (selectedAllergies.includes(item)) {
      setSelectedAllergies(selectedAllergies.filter(i => i !== item));
    } else {
      setSelectedAllergies([...selectedAllergies, item]);
    }
  };
  
  const handleSave = async () => {
    try {
        const token = await getAuthToken();
        const updatedUser = { 
            ...userData, 
            banned: getBitsFromBannedList(selectedAllergies),
            bannedList: selectedAllergies
        };
        const response = await axios.put(`${API_BASE_URL}/api/update`, updatedUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data === 1) {
            Alert.alert('성공', '알레르기 정보가 저장되었습니다.');
            navigation.goBack();
        } else {
            Alert.alert('오류', '알레르기 정보 업데이트에 실패했습니다.');
        }
    } catch (error) {
        console.error('Failed to update allergy:', error);
        Alert.alert('오류', '알레르기 정보 업데이트에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>알레르기 선택</Text>
      </View>

      <TextInput
        placeholder="알레르기 검색"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#888"
      />

      {/* ## 카테고리 UI 제거 ## */}
      <ScrollView contentContainerStyle={styles.itemsContainer}>
        {filteredAllergies.map((item, index) => {
            const isSelected = selectedAllergies.includes(item);
            return (
                <TouchableOpacity
                    key={index}
                    style={styles.itemButton}
                    onPress={() => toggleAllergy(item)}
                >
                    <Text style={[ styles.itemButtonText, isSelected && styles.selectedItemButtonText ]}>
                        {item}
                    </Text>
                </TouchableOpacity>
            );
        })}
      </ScrollView>

      <View style={styles.selectedItemsContainerWrapper}>
        <Text style={styles.selectedItemsTitle}>나의 알레르기:</Text>
        <ScrollView style={styles.selectedItemsScroll} contentContainerStyle={styles.selectedItemsList}>
          {selectedAllergies.map(item => (
            <TouchableOpacity key={item} style={styles.selectedItemChip} onPress={() => toggleAllergy(item)}>
              <Text style={styles.selectedItemText}>{item}</Text>
              <XMarkIcon size={hp(2)} color="white" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: wp(5), paddingTop: hp(6), backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(3), },
    backButton: { marginRight: wp(3), },
    title: { fontSize: hp(3.5), fontWeight: 'bold', color: '#333' },
    searchInput: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: hp(1.5), paddingHorizontal: wp(4), fontSize: hp(2.2), marginBottom: hp(2) },
    separator: { height: 1, backgroundColor: '#000000', marginBottom: hp(2) },
    itemsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: hp(2), },
    itemButton: { backgroundColor: '#f9fafb', paddingVertical: hp(1.5), paddingHorizontal: wp(4), borderRadius: 8, marginRight: wp(2), marginBottom: hp(1.5), },
    itemButtonText: { fontSize: hp(2.2), color: '#6b7280' },
    selectedItemButtonText: { color: '#1f2937', fontWeight: 'bold' },
    selectedItemsContainerWrapper: { flex: 1, },
    selectedItemsTitle: { fontSize: hp(2.5), fontWeight: 'bold', color: '#333', marginBottom: hp(1), },
    selectedItemsScroll: { flex: 1, maxHeight: hp(25), },
    selectedItemsList: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: hp(1), },
    selectedItemChip: { backgroundColor: '#4b5563', borderRadius: 8, paddingVertical: hp(1), paddingHorizontal: wp(3), marginRight: wp(2), marginBottom: hp(1.5), flexDirection: 'row', alignItems: 'center', },
    selectedItemText: { color: 'white', fontSize: hp(2.2), marginRight: 5, },
    saveButton: { backgroundColor: '#374151', paddingVertical: hp(2), borderRadius: 8, alignItems: 'center', marginTop: 'auto', marginBottom: hp(3), },
    saveButtonText: { color: 'white', fontSize: hp(2.5), fontWeight: 'bold' }
});