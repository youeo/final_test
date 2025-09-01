import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';

const API_BASE_URL = 'http://43.200.200.161:8080';

const POPULAR_INGREDIENTS = {
  '육류': ['돼지고기', '닭고기', '소고기', '오리고기', '양고기'],
  '해산물': ['오징어', '새우', '고등어', '갈치', '연어', '멸치', '조개', '게', '문어'],
  '채소': ['양파', '마늘', '대파', '감자', '당근', '고추', '깻잎', '상추', '시금치', '버섯', '오이', '토마토', '배추', '무', '애호박', '양배추'],
  '과일': ['사과', '바나나', '딸기', '레몬', '오렌지', '포도', '수박'],
  '향신료': ['설탕', '소금', '후추', '고춧가루', '참기름', '간장', '된장', '고추장'],
  '축산물(유제품포함)': ['계란', '우유', '치즈', '버터', '생크림', '요거트'],
  '가공식품': ['베이컨', '소시지', '햄', '참치캔', '두부', '김치', '식빵', '라면', '어묵']
};
const CATEGORIES = ['전체', '육류', '해산물', '채소', '과일', '향신료', '축산물(유제품포함)', '가공식품'];

export default function SelectIngredientsScreen({ route, navigation }) {
  const { userData } = route.params;
  const insets = useSafeAreaInsets();

  const [selectedIngredients, setSelectedIngredients] = useState(userData.ingredients || []);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('전체');

  // --- 재료 직접 추가를 위한 모달 상태 추가 ---
  const [modalVisible, setModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setSearchResults([]);
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/searchIngredients`, {
        params: { ingredient: search },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search ingredients:', error);
      Alert.alert('오류', '재료 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (ingredientName) => {
    const isAlreadySelected = selectedIngredients.some(ing => ing.name === ingredientName);
    if (isAlreadySelected) {
      setSelectedIngredients(selectedIngredients.filter(i => i.name !== ingredientName));
    } else {
      const found = searchResults.find(r => r.name === ingredientName);
      const newIngredient = { 
          name: ingredientName, 
          code: found?.code || 0, 
          type: found?.type || 0 
      };
      setSelectedIngredients([...selectedIngredients, newIngredient]);
    }
  };

  const handleSave = async () => {
    try {
        const token = await getAuthToken();
        const updatedUser = { 
            ...userData, 
            ingredients: selectedIngredients 
        };
        await axios.put(`${API_BASE_URL}/api/update`, updatedUser, {
            headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('성공', '냉장고 현황이 저장되었습니다.');
        navigation.goBack();
    } catch (error) {
        console.error('Failed to update ingredients:', error);
        Alert.alert('오류', '냉장고 현황 업데이트에 실패했습니다.');
    }
  };

  // --- 직접 추가 로직 ---
  const handleCustomAdd = () => {
    const v = customInput.trim();
    if (v && !selectedIngredients.some(i => i.name === v)) {
      setSelectedIngredients(prev => [...prev, { name: v, code: 0, type: 0 }]);
      setCustomInput('');
      setModalVisible(false);
    }
  };
  
  const renderIngredients = () => {
    let listToRender = [];
    if (search.trim()) { // 검색어가 있을 경우 검색 결과만 표시
        listToRender = searchResults.map(item => item.name);
    } else { // 검색어가 없을 경우 카테고리별 인기 재료 표시
      if (activeCategory === '전체') {
        listToRender = Object.values(POPULAR_INGREDIENTS).flat();
      } else {
        listToRender = POPULAR_INGREDIENTS[activeCategory] || [];
      }
    }
    
    // 중복 제거
    const uniqueList = [...new Set(listToRender)];

    return (
        <>
            {uniqueList.map((name, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.itemButton}
                    onPress={() => toggleIngredient(name)}
                >
                    <Text>{name}</Text>
                </TouchableOpacity>
            ))}
            {/* --- 직접 추가 버튼 --- */}
            <TouchableOpacity
                style={[styles.itemButton, { backgroundColor: '#e5e7eb' }]}
                onPress={() => setModalVisible(true)}
            >
                <Text>+ 추가</Text>
            </TouchableOpacity>
        </>
    );
  }

  return (
    <SafeAreaView style={{flex:1}} edges={['bottom','left','right']}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> navigation.goBack()} style={styles.headerButton}>
            <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={{fontSize: hp(2), color: '#fbbf24', fontWeight: 'bold'}}>저장</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>냉장고 재료 선택</Text>
        </View>

        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder='재료 검색...'
              placeholderTextColor={'gray'}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
              <AntDesign name="search1" size={hp(2.5)} color="#ffab00"/>
            </TouchableOpacity>
          </View>
        </View>

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
                  onPress={() => {
                      setActiveCategory(category);
                      setSearch('');
                      setSearchResults([]);
                  }}
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

        <View style={styles.listContainer}>
          <ScrollView
            contentContainerStyle={styles.itemsContainer}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? <ActivityIndicator size="large" color="#4b5563" /> : renderIngredients()}
          </ScrollView>
        </View>

        <View style={styles.selectedBox}>
          <Text style={styles.selectedBoxTitle}>나의 냉장고</Text>
          <ScrollView horizontal keyboardShouldPersistTaps="handled">
            {selectedIngredients.map((item, index) => (
              <View key={index} style={styles.selectedChip}>
                <Text>{item.name}</Text>
                <TouchableOpacity onPress={() => toggleIngredient(item.name)} style={{marginLeft: 5}}>
                  <Text>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* --- 직접 추가 모달 --- */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>재료 직접 추가</Text>
              <TextInput
                placeholder="예: 닭가슴살"
                value={customInput}
                onChangeText={setCustomInput}
                style={styles.modalInput}
                returnKeyType="done"
                onSubmitEditing={handleCustomAdd}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCustomAdd} style={styles.modalButton}>
                  <Text style={{fontWeight: 'bold'}}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

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
        backgroundColor: '#f3f4f6',
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
        color: '#4b5563',
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
        backgroundColor: '#fbbf24',
    },
    inactiveCategoryPill: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    categoryText: {
        fontWeight: '600',
        color: '#4b5563',
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
        color: '#4b5563',
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        padding: 10,
        marginLeft: 15,
    }
});