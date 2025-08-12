import { View, Text, ScrollView, Image, TextInput, StatusBar, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { ChevronLeftIcon, ClockIcon, FireIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';
import Categories from '../components/categories';
import axios from 'axios';
import Recipes2 from '../components/recipes2';
export default function SecondScreen() {

  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Beef');
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);

  useEffect(()=>{
    getCategories();
    getRecipes();
  },[])

  const handleChangeCategory = category=>{
    getRecipes(category);
    setActiveCategory(category);
    setMeals([]);
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
  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 50}}
        className="space-y-6 pt-2"
      >
        
      {/* 뒤로가기 */}
      <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full flex-row justify-between items-center pt-14">
        <TouchableOpacity onPress={()=> navigation.goBack()} className="p-2 rounded-full ml-5 bg-gr">
            <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
        </TouchableOpacity>
      </Animated.View>

        {/* categories */}
        <View>
          { categories.length>0 && <Categories categories={categories} activeCategory={activeCategory} handleChangeCategory={handleChangeCategory} /> }
        </View>

        {/* recipes */}
        <View>
          <Recipes2 meals={meals} categories={categories} />
        </View>
      </ScrollView>
    </View>
  )
}