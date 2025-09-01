import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';

const API_BASE_URL = 'http://43.200.200.161:8080';

const ALLERGY_BIT_MAP = {
  '돼지고기': 1, '쇠고기': 2, '닭고기': 4, '고등어': 8, '게': 16, '새우': 32, '오징어': 64, '조개류': 128,
  '대두': 256, '땅콩': 512, '메밀': 1024, '밀': 2048, '잣': 4096, '호두': 8192, '복숭아': 16384,
  '토마토': 32768, '난류': 65536, '우유': 131072, '아황산': 262144
};

const POPULAR_ALLERGIES = {
    '육류': ['돼지고기', '쇠고기', '닭고기'],
    '해산물': ['고등어', '게', '새우', '오징어', '조개류'],
    '견과류/곡물': ['대두', '땅콩', '메밀', '밀', '잣', '호두'],
    '과일/채소': ['복숭아', '토마토'],
    '기타': ['난류', '우유', '아황산'],
};
const CATEGORIES = ['전체', '육류', '해산물', '견과류/곡물', '과일/채소', '기타'];

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
  const insets = useSafeAreaInsets();

  const [selectedAllergies, setSelectedAllergies] = useState(userData.bannedList || []);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

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
        await axios.put(`${API_BASE_URL}/api/update`, updatedUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('성공', '알레르기 정보가 저장되었습니다.');
        navigation.goBack();
    } catch (error) {
        console.error('Failed to update allergy:', error);
        Alert.alert('오류', '알레르기 정보 업데이트에 실패했습니다.');
    }
  };

  const renderAllergies = () => {
    let listToRender = [];
    if (activeCategory === '전체') {
      listToRender = Object.values(POPULAR_ALLERGIES).flat();
    } else {
      listToRender = POPULAR_ALLERGIES[activeCategory] || [];
    }

    const filteredList = listToRender.filter(item => item.includes(search));

    return filteredList.map((item, index) => {
        return (
            <TouchableOpacity
                key={index}
                style={styles.itemButton}
                onPress={() => toggleAllergy(item)}
            >
                <Text>{item}</Text>
            </TouchableOpacity>
        );
    });
  }

  return (
    <SafeAreaView style={{flex:1}} edges={['bottom','left','right']}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        
        {/* --- 헤더 UI 수정 --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> navigation.goBack()} style={styles.headerButton}>
            <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={{fontSize: hp(2), color: '#fbbf24', fontWeight: 'bold'}}>저장</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>알레르기 선택</Text>
        </View>

        {/* --- 검색창 UI 수정 --- */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder='알레르기 검색...'
              placeholderTextColor={'gray'}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            <View style={styles.searchIconContainer}>
              <AntDesign name="search1" size={hp(2.5)} color="#ffab00"/>
            </View>
          </View>
        </View>

        {/* --- 카테고리 UI 수정 --- */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 15}}
          >
            {CATEGORIES.map((category)=>{
              const isActive = category === activeCategory;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={styles.categoryTouch}
                >
                  <View style={[styles.categoryPill, isActive ? styles.activeCategoryPill : styles.inactiveCategoryPill]}>
                    <Text style={styles.categoryText}>
                      {category}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
        
        <View style={styles.listTitleContainer}>
          <Text style={styles.listTitle}>{activeCategory}</Text>
        </View>

        {/* --- 목록 UI 수정 --- */}
        <View style={styles.listContainer}>
          <ScrollView
            contentContainerStyle={styles.itemsContainer}
            keyboardShouldPersistTaps="handled"
          >
            {renderAllergies()}
          </ScrollView>
        </View>

        {/* --- 하단 선택 목록 UI 수정 --- */}
        <View style={styles.selectedBox}>
          <Text style={styles.selectedBoxTitle}>나의 알레르기</Text>
          <ScrollView horizontal keyboardShouldPersistTaps="handled">
            {selectedAllergies.map(item => (
              <View key={item} style={styles.selectedChip}>
                <Text>{item}</Text>
                <TouchableOpacity onPress={() => toggleAllergy(item)} style={{marginLeft: 5}}>
                  <Text>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- recipe_search 스타일에 맞게 대폭 수정 ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: hp(7),
        paddingHorizontal: wp(5),
    },
    headerButton: {
        backgroundColor: '#f3f4f6', // bg-gr 대체
        padding: 10,
        borderRadius: 999,
    },
    titleContainer: {
        flex: 0.15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    title: {
        fontSize: hp(3),
        fontWeight: 'bold',
        color: '#4b5563', // text-neutral-600
    },
    searchWrapper: {
        flex: 0.15,
        paddingHorizontal: wp(4),
        justifyContent: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: hp(1.7),
        paddingLeft: 12,
    },
    searchIconContainer: {
        backgroundColor: 'white',
        borderRadius: 999,
        padding: 8,
    },
    categoryContainer: {
        flex: 0.1,
        justifyContent: 'center',
    },
    categoryTouch: {
        alignItems: 'center',
        marginHorizontal: 4,
    },
    categoryPill: {
        borderRadius: 999,
        padding: 8,
    },
    activeCategoryPill: {
        backgroundColor: '#fbbf24', // amber-400
    },
    inactiveCategoryPill: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    categoryText: {
        fontWeight: '600',
        color: '#4b5563', // text-neutral-600
        marginHorizontal: 4,
        fontSize: hp(1.6),
    },
    listTitleContainer: {
        flex: 0.1,
        paddingHorizontal: wp(5),
        justifyContent: 'center',
    },
    listTitle: {
        fontSize: hp(2),
        fontWeight: 'bold',
        color: '#4b5563', // text-neutral-600
    },
    listContainer: {
        flex: 1,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: wp(4),
        paddingBottom: 8,
    },
    itemButton: {
        backgroundColor: '#d9d9d9',
        padding: 10,
        borderRadius: 20,
        margin: 5,
    },
    selectedBox: {
        backgroundColor: '#43794b',
        padding: 15,
        borderRadius: 20,
        marginVertical: 10,
        marginHorizontal: 12,
    },
    selectedBoxTitle: {
        color: 'white',
        marginBottom: 5,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    selectedChip: {
        backgroundColor: '#d9d9d9',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        marginVertical: 5,
    },
});