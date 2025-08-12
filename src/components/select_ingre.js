import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Button, Pressable, Modal, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';
import Categories2 from './categories2';

const CATEGORIES = ['전체', '육류', '수산물', '채소', '과일', '유제품', '가공식품'];
const INGREDIENTS = {
  육류: ['소고기', '돼지고기', '닭', '양고기'],
  수산물: ['연어', '고등어', '참치', '새우'],
  채소: ['상추', '양파', '당근'],
  과일: ['사과', '바나나'],
  유제품: ['우유', '치즈'],
  가공식품: ['김치', '햄']
};

export default function Select_ingre() {

    const navigation = useNavigation();
    const [activeCategory, setActiveCategory] = useState('Beef');
    const [categories, setCategories] = useState([]);
    const [meals, setMeals] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [search, setSearch] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [customInput, setCustomInput] = useState('');
      const allIngredients = selectedCategory === '전체'
      ? Object.values(INGREDIENTS).flat()
      : INGREDIENTS[selectedCategory] || [];

    const filtered = allIngredients.filter(i => i.includes(search));

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
          setCategories(response.data.categories);
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
              />
              <View className="bg-white rounded-full px-3 pt-2.5">
                <AntDesign name="search1" size={hp(2.5)} color="#ffab00"/>
              </View>
            </View>
          </View>

          {/* 카테고리 */}
          <View className="pt-4">
            { categories.length>0 && <Categories2 categories={categories} activeCategory={activeCategory} handleChangeCategory={handleChangeCategory} /> }
            <Text style={{fontSize: hp(2)}} className="pt-6 mx-4 font-semibold text-neutral-600">{activeCategory}</Text>
          </View>

          {/* 재료 리스트 */}
          <ScrollView contentContainerStyle={styles.ingredientsWrap}>
            {filtered.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => addIngredient(item)}
                style={styles.ingredientButton}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.ingredientButton, { backgroundColor: '#ddd' }]}
              onPress={() => setModalVisible(true)}
            >
              <Text>+ 추가</Text>
            </TouchableOpacity>
          </ScrollView>
          
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
  ingredientButton: {
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