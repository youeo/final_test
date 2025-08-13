import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Button, Pressable, Modal, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getAuthToken } from '../../AuthService';

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


export default function Select_ingreScreen() {

    const navigation = useNavigation();
    const [activeCategory, setActiveCategory] = useState('전체');
    const allCategories = Object.values(CATEGORIES).flat()
    const [meals, setMeals] = useState([]);

    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [search, setSearch] = useState('');
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
        console.log(response.data);
      } catch (error) {
        console.error('Failed to search ingredients:', error);
        Alert.alert('오류', '재료 검색에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    // 냉장고 재료 필터링
    const myIngredientsByCategory = selectedCategory === '전체'
      ? searchResults.map(i => i.ingredientName)
      : searchResults
          .filter(i => i.type === selectedCategory)
          .map(i => i.ingredientName);

    // 인기 재료 필터링
    const popularIngredientsByCategory = selectedCategory === '전체'
      ? Object.values(POPULAR_INGREDIENTS).flat()
      : POPULAR_INGREDIENTS[selectedCategory] || [];

    // 중복 제거
    const allIngredients = [...new Set([
      ...popularIngredientsByCategory,
      ...myIngredientsByCategory
    ])];

    const filtered_c = allCategories.filter(i => i.includes(search));
    const filtered_i = allIngredients.filter(i => i.includes(search));

    const addIngredient = (item) => {
      if (!selectedIngredients.includes(item)) {
        setSelectedIngredients([...selectedIngredients, item]);
      }
    };

    const removeIngredient = (item) => {
      setSelectedIngredients(selectedIngredients.filter(i => i !== item));
    };

  const handleCustomAdd = () => {
    if (customInput.trim() && !selectedIngredients.includes(customInput.trim())) {
      setSelectedIngredients([...selectedIngredients, customInput.trim()]);
      setCustomInput('');
      setModalVisible(false);
    }
  };

    useEffect(()=>{
        getCategories();
        getRecipes();
        handleSearch();
      },[])

    const handleChangeCategory = category=>{
      getRecipes(category);
      setActiveCategory(category);
      setMeals([]);
    }

    const getRecipes = async (category="Beef")=>{
      try{
        const response = await axios.get(`https://themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        // console.log('got recipes: ',response.data);
        if(response && response.data){
          setMeals(response.data.meals);
        }
      }catch(err){
        console.log('error: ',err.message);
      }
    }

    const getCategories = async ()=>{
      try{
        const response = await axios.get('https://themealdb.com/api/json/v1/1/categories.php');
        // console.log('got categories: ',response.data);
        if(response && response.data){
          //setCategories(response.data.categories);
        }
      }catch(err){
        console.log('error: ',err.message);
      }
    }
    
    return (
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)} className="flex-1 space-y-4 flex-col">
            <StatusBar hidden={true} />

            {/* 뒤로가기 */}
            <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full flex-row justify-between items-center pt-14">
                <TouchableOpacity onPress={()=> navigation.goBack()} className="p-2 rounded-full ml-5 bg-gr">
                    <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> navigation.navigate('Select_main', {selectedIngredients})} className="p-2 rounded-full mr-5 bg-gr">
                    <Text style={{fontSize: hp(2)}} className='text-ye font-bold'>완료</Text>
                </TouchableOpacity>
            </Animated.View>
            
            <View style={{flex: 0.15}} className="mx-4 space-y-2 justify-start items-center">
                <Text style={{fontSize: hp(3)}} className="font-bold text-neutral-600">재료 선택</Text>
            </View>

          {/* search bar */}
          <View style={{flex: 0.15}}>
            <View className="mx-4 flex-row item-center rounded-full bg-black/5 p-[6px]">
              <TextInput
                placeholder='재료 검색...'
                placeholderTextColor={'gray'}
                style={{fontSize: hp(1.5)}}
                className="flex-1 text-base mb-0 pl-3 tracking-wider"
                value={search}
                onChangeText={setSearch}
              />
              <View className="bg-white rounded-full px-3 pt-2.5">
                <AntDesign name="search1" size={hp(2.5)} color="#ffab00"/>
              </View>
            </View>
          </View>

          {/* 카테고리 */}
          <View style={{flex: 0.1}}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="space-x-3 mx-1"
              contentContainerStyle={{paddingHorizontal: 15}}
            >
              {
                filtered_c.map((item, index)=>{
                    let activeButtonClass = item == activeCategory? ' bg-amber-400': ' bg-black/10';
                    return (
                        <TouchableOpacity
                            key={item}
                            onPress={() => {
                              setActiveCategory(item);       // UI에 표시할 현재 카테고리
                              setSelectedCategory(item);     // 실제 재료 필터 기준
                            }}
                            className="flex items-center space-y-1"
                        >
                            <View className={"rounded-full p-[7px]"+activeButtonClass}>
                              <Text className="font-semibold text-neutral-600 m-1 mt-0" style={{fontSize: hp(1.6)}}>
                                  {item}
                              </Text>
                            </View>
                        </TouchableOpacity>
                    )
                })
              }
            </ScrollView>
          </View>

          <View style={{flex: 0.1}}>
              <Text style={{fontSize: hp(2)}} className="mx-5 p-1 font-bold text-neutral-600">{activeCategory}</Text>
          </View>

          {/* 재료 리스트 */}
          <View style={{flex: 0.9}}>
            <ScrollView
              contentContainerStyle={{...styles.ingredientsWrap, flexGrow: 1}}
            >
              {filtered_i.map((item) => {
                const isMine = searchResults.some(i => i.ingredientName === item);
                return(
                  <TouchableOpacity
                    key={item}
                    onPress={() => addIngredient(item)}
                    style={styles.button}
                  >
                    <Text
                      style={isMine ? { fontWeight: 'bold' } : {}}
                    >
                      {item}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ddd' }]}
                onPress={() => setModalVisible(true)}
              >
                <Text>+ 추가</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          {/* 선택된 재료 표시 */}
          <View style={styles.selectedBox}>
            <Text style={{ color: 'white', marginBottom: 5, textAlign: 'center', fontWeight: 'bold' }}>사용할 재료</Text>
            <ScrollView horizontal>
              {selectedIngredients.map((item) => (
                <View key={item} style={styles.selectedChip}>
                  <Text>{item}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(item)}>
                    <Text style={{ marginLeft: 5 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 재료 추가 모달 창 구현 */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>재료 추가</Text>
                <TextInput
                  placeholder="예: 계란"
                  value={customInput}
                  onChangeText={setCustomInput}
                  style={styles.modalInput}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCustomAdd}>
                    <Text>추가</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        
        </Animated.View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 0.5, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  search: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginBottom: 10,
  },
  tabs: { marginBottom: 10 },
  tab: { marginRight: 15, fontSize: 16, color: 'gray' },
  activeTab: { color: 'black', fontWeight: 'bold' },
  ingredientsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', flex: 0.15, marginLeft: 11, marginRight: 11,
  },
  button: {
    backgroundColor: '#d9d9d9', fontSize: hp(1.6), padding: 10, borderRadius: 20, margin: 5,
  },
  selectedBox: {
    backgroundColor: '#444', padding: 15, borderRadius: 20, marginTop: 20, flex: 0.3,
  },
  selectedChip: {
    backgroundColor: '#d9d9d9', fontSize: hp(1.6), borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    flexDirection: 'row', alignItems: 'center', marginRight: 10, marginTop: 25, marginBottom: 25,
  },
  overlay: {
    flex: 1, justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20,
  },
});