import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon, XMarkIcon } from 'react-native-heroicons/outline';

const API_BASE_URL = 'http://43.200.200.161:8080';

const TOOLS_BIT_MAP = {
  '프라이팬': 1, '냄비': 2, '웍': 4, '밀대': 8, '믹서기': 16, '핸드블랜더': 32, '거품기': 64,
  '연육기': 128, '착즙기': 256, '전자레인지': 512, '가스레인지': 1024, '오븐': 2048,
  '에어프라이어': 4096, '주전자': 8192, '압력솥': 16384, '토스터': 32768, '찜기': 65536
};
const ALL_TOOLS = Object.keys(TOOLS_BIT_MAP);

const getBitsFromToolList = (toolList) => {
  let bits = 0;
  for (const name of toolList) {
    if (TOOLS_BIT_MAP[name]) {
      bits |= TOOLS_BIT_MAP[name];
    }
  }
  return bits;
};

export default function SelectToolScreen({ route, navigation }) {
  const { userData } = route.params;
  const [selectedTools, setSelectedTools] = useState(userData.toolsList || []);
  const [search, setSearch] = useState('');

  const filteredTools = ALL_TOOLS.filter(item => item.includes(search));

  const toggleTool = (item) => {
    if (selectedTools.includes(item)) {
      setSelectedTools(selectedTools.filter(i => i !== item));
    } else {
      setSelectedTools([...selectedTools, item]);
    }
  };

  const handleSave = async () => {
    try {
        const token = await getAuthToken();
        const updatedUser = { 
            ...userData, 
            tools: getBitsFromToolList(selectedTools),
            toolsList: selectedTools 
        };
        await axios.put(`${API_BASE_URL}/api/update`, updatedUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('성공', '조리도구 정보가 저장되었습니다.');
        navigation.goBack();
    } catch (error) {
        console.error('Failed to update tools:', error);
        Alert.alert('오류', '조리도구 정보 업데이트에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>조리도구 선택</Text>
      </View>

      <TextInput
        placeholder="조리도구 검색"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#888"
      />
      
      {/* ## 카테고리 UI 제거 ## */}
      <ScrollView contentContainerStyle={styles.itemsContainer}>
        {filteredTools.map((item, index) => {
            const isSelected = selectedTools.includes(item);
            return (
                <TouchableOpacity
                    key={index}
                    style={styles.itemButton}
                    onPress={() => toggleTool(item)}
                >
                    <Text style={[ styles.itemButtonText, isSelected && styles.selectedItemButtonText ]}>
                        {item}
                    </Text>
                </TouchableOpacity>
            );
        })}
      </ScrollView>

      <View style={styles.selectedItemsContainerWrapper}>
        <Text style={styles.selectedItemsTitle}>나의 조리도구:</Text>
        <ScrollView style={styles.selectedItemsScroll} contentContainerStyle={styles.selectedItemsList}>
          {selectedTools.map(item => (
            <TouchableOpacity key={item} style={styles.selectedItemChip} onPress={() => toggleTool(item)}>
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