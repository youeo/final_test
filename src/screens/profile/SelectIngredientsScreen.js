import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar } from 'react-native';
import axios from 'axios';
import { getAuthToken } from '../../AuthService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ChevronLeftIcon, XMarkIcon } from 'react-native-heroicons/outline';

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
  const [selectedIngredients, setSelectedIngredients] = useState(userData.ingredients || []);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('전체');

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
      const newIngredient = { name: ingredientName, code: 0, type: 0 };
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
  
  const renderIngredients = () => {
    let listToRender = [];
    if (search.trim() && searchResults.length > 0) {
      listToRender = searchResults.map(item => item.name);
    } else if (!search.trim()) {
      if (activeCategory === '전체') {
        listToRender = Object.values(POPULAR_INGREDIENTS).flat();
      } else {
        listToRender = POPULAR_INGREDIENTS[activeCategory] || [];
      }
    }

    return listToRender.map((name, index) => {
        const isSelected = selectedIngredients.some(ing => ing.name === name);
        return (
            <TouchableOpacity
                key={index}
                style={styles.itemButton}
                onPress={() => toggleIngredient(name)}
            >
                <Text style={[ styles.itemButtonText, isSelected && styles.selectedItemButtonText ]}>
                    {name}
                </Text>
            </TouchableOpacity>
        );
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>냉장고 재료 선택</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="재료 검색 (인기 재료 외)"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#888"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{height: hp(6), marginBottom: hp(2)}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(category => {
                const isActive = category === activeCategory;
                return (
                    <TouchableOpacity 
                        key={category} 
                        onPress={() => {
                            setActiveCategory(category);
                            setSearch('');
                            setSearchResults([]);
                        }}
                        style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
                    >
                        <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>{category}</Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
      </View>

      <View style={styles.separator} />

      <ScrollView contentContainerStyle={styles.itemsContainer}>
        {loading ? <ActivityIndicator size="large" color="#4b5563" /> : renderIngredients()}
      </ScrollView>

      
      <View style={styles.selectedItemsContainerWrapper}>
        <Text style={styles.selectedItemsTitle}>나의 냉장고:</Text>
        <ScrollView style={styles.selectedItemsScroll} contentContainerStyle={styles.selectedItemsList}>
          {selectedIngredients.map((item, index) => (
            <TouchableOpacity key={index} style={styles.selectedItemChip} onPress={() => toggleIngredient(item.name)}>
              <Text style={styles.selectedItemText}>{item.name}</Text>
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
    searchContainer: { flexDirection: 'row', marginBottom: hp(2), },
    searchInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: hp(1.5), paddingHorizontal: wp(4), fontSize: hp(2.2), },
    searchButton: { marginLeft: 10, backgroundColor: '#4b5563', paddingHorizontal: wp(5), borderRadius: 8, alignItems: 'center', justifyContent: 'center', },
    searchButtonText: { color: 'white', fontSize: hp(2.2), fontWeight: 'bold', },
    categoryButton: { paddingVertical: hp(1), paddingHorizontal: wp(4), marginRight: wp(2), borderRadius: 16, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    activeCategoryButton: { backgroundColor: '#374151' },
    categoryText: { fontSize: hp(2), color: '#374151', fontWeight: '500' },
    activeCategoryText: { color: 'white', fontWeight: 'bold' },
    separator: { height: 1, backgroundColor: '#000000', marginBottom: hp(2) },
    itemsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: hp(2), },
    itemButton: { backgroundColor: '#f9fafb', paddingVertical: hp(1.5), paddingHorizontal: wp(4), borderRadius: 8, marginRight: wp(2), marginBottom: hp(1.5), },
    itemButtonText: { fontSize: hp(2.2), color: '#6b7280' },
    selectedItemButtonText: { color: '#1f2937', fontWeight: 'bold' }, 
    selectedItemsContainerWrapper: { flex: 1, },
    selectedItemsTitle: { fontSize: hp(2.5), fontWeight: 'bold', color: '#333', marginBottom: hp(1), },
    selectedItemsScroll: { flex: 1, maxHeight: hp(15), },
    selectedItemsList: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: hp(1), },
    selectedItemChip: { backgroundColor: '#4b5563', borderRadius: 8, paddingVertical: hp(1), paddingHorizontal: wp(3), marginRight: wp(2), marginBottom: hp(1.5), flexDirection: 'row', alignItems: 'center', },
    selectedItemText: { color: 'white', fontSize: hp(2.2), marginRight: 5, },
    saveButton: { backgroundColor: '#374151', paddingVertical: hp(2), borderRadius: 8, alignItems: 'center', marginTop: 'auto', marginBottom: hp(3), },
    saveButtonText: { color: 'white', fontSize: hp(2.5), fontWeight: 'bold' }
});