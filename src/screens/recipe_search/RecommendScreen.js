import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Pressable, Image, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import MasonryList from '@react-native-seoul/masonry-list';
import axios from 'axios';
import Loading from './loading';
import { StatusBar } from 'expo-status-bar'
import { AntDesign } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Item = ({ title, author, time, recipe}) => (
  <ScrollView
    className="mx-5"
    style={{marginTop: 15}}
    showsHorizontalScrollIndicator={true}
  >
    <View style={{flex: 1, flexDirection: 'row', backgroundColor: '#ddd', borderWidth: 1, borderColor: '#bab8b8'}} className="space-x-2 rounded-2xl px-3 py-3">
      <View style={{flex: 0.3}}>
        <Image source={require('../../../assets/images/placeholder.jpg')}
          style={{width: 80, height: 80}}
          className="rounded-full" />
      </View>
      <View style={{flex: 0.6}} className="space-y-2">
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text className="font-semibold text-lg">{title}</Text>
          <Text className="text-xs text-gray-400">{author}</Text>
          <View style={{
            backgroundColor: '#fbbf24',   // 노란색 배경 (#fbbf24 도 OK)
            borderRadius: 9999,           // 완전한 원형
            paddingHorizontal: 10,
            paddingVertical: 4,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'flex-start',      // 원하는 위치 제어
          }}>
            <Text className="text-xs text-white font-semibold">{time}</Text>
          </View>
        </View>
        <Text className="text-sm">
          {String(recipe[0]).length > 15 ? `${String(recipe[0]).slice(0, 15)}...` : recipe}
        </Text>
      </View>
      <View style={{flex: 0.1}} className="items-end justify-end">
        <AntDesign name="doubleright" size={hp(2)} color="black" onPress={false}/>
      </View>
    </View>
  </ScrollView>
);

export default function RecommendScreen() {

    const [showModal, setShowModal] = useState(true);
    const [activeTab, setActiveTab] = useState('possible');
    const navigation = useNavigation();

    const [rec, setrec] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [callCount, setCallCount] = useState(0);

    const testSearchFromAI = async () => {

      const url = `http://43.200.200.161:8080/recipe/searchFromAI`;
      const token = await AsyncStorage.getItem('accessToken');
      console.log('불러온 토큰:', token);

      const requestData = {
        mainIngredients: {
          name: '돼지고기',
          count: '200g',
          type: 1  // 육류
        },
        subIngredients: [
          { name: '양파', count: '1개', type: 2 },  // 채소
          { name: '마늘', count: '2쪽', type: 2 }
        ],
        Banned: 0,  // 금지 재료 코드 예시
        Tool: 1     // 도구 코드 예시
      };

      try {
        const response = await axios.post(url, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('AI 추천 레시피 결과:', response.data);
        if(response && response.data){
          setrec(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('API 요청 실패:', error.message);
        setIsLoading(false);
      }

    }

    // 이후에 여러개 가져오기 위한 조건문 포함
    useEffect(() => {
      if (callCount < 1) {
        testSearchFromAI();
        setCallCount(prev => prev + 1);
      }
    })

    // const filteredRecipes = recipes.filter(recipe =>
    //     activeTab === 'possible' ? recipe.available : !recipe.available
    // );

    return (
        <Animated.View entering={FadeInDown.delay(100).duration(800).springify().damping(12)} className="flex-1 space-y-4 flex-col">
              <StatusBar hidden={true} />
          <Modal visible={showModal} animationType="slide" transparent={false}>
          <View style={styles.container}>
              {/* 헤더 */}
              <View style={[styles.header, {backgroundColor: 'gray', flex: 0.1}]} className="justify-between">
                <TouchableOpacity onPress={()=> navigation.goBack()} className="p-2 rounded-full ml-1 bg-gr">
                    {/* <AntDesign name="arrowleft" size={24} color="black" /> */}
                    <ChevronLeftIcon  strokeWidth={4.5} color="#fbbf24" />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> navigation.navigate('Home')} className="p-2 rounded-full ml-1 bg-gr">
                    {/* <AntDesign name="arrowleft" size={24} color="black" /> */}
                    <FontAwesome name="home" size={24} color="#fbbf24" />
                </TouchableOpacity>
              </View>

              {/* 탭 메뉴 */}
              <View style={styles.tabs}>
                  <TouchableOpacity
                      style={[styles.tab, activeTab === 'possible' && styles.activeTab]}
                      className="px-8 rounded-2xl"
                      onPress={() => setActiveTab('possible')}
                  >
                      <Text>현재 가능한 레시피</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={[styles.tab, activeTab === 'needs' && styles.activeTab]}
                      className="rounded-2xl"
                      onPress={() => setActiveTab('needs')}
                  >
                      <Text>추가 재료가 필요한 레시피</Text>
                  </TouchableOpacity>
              </View>

              {/* 정렬 */}
              <TouchableOpacity style={styles.sort} className="my-1 mb-4">
              <Text>정렬기준 <AntDesign name="filter" size={15} className="font-semibold" /></Text>
              </TouchableOpacity>

              {/* search bar */}
              <View style={{flex: 0.15}}>
                <View className="mx-4 flex-row item-center rounded-full bg-black/5 p-[6px]">
                  <TextInput
                    placeholder='레시피 검색...'
                    placeholderTextColor={'gray'}
                    style={{fontSize: hp(1.5)}}
                    className="flex-1 text-base mb-0 pl-3 tracking-wider"
                  />
                  <View className="bg-white rounded-full px-3 pt-2.5">
                    <AntDesign name="search1" size={hp(2.5)} color="#ffab00"/>
                  </View>
                </View>
              </View>

              {/* 테스트 */}
              <View style={{flex: 0.85}}>
                {/* <Text>아이템의 개수: {rec.length}</Text> */}
                {
                  isLoading && rec.length==0 ? (
                      <Loading size="large" className="mt-20" />
                  ): (
                      <MasonryList
                          data={rec}
                          keyExtractor={(item) => item.code.toString()}
                          numColumns={1}
                          showsHorizontalScrollIndicator = {true}
                          renderItem={({item}) => <Item title={item.name} author={item.author} time={item.time} recipe={item.recipe}/>}
                      />
                  )
                }
              </View>
          </View>
          </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1},
    header: {
      flexDirection: 'row', alignItems: 'center',
      padding: 16, borderBottomWidth: 1, borderColor: '#ddd',
    },
    headerTitle: { fontSize: 18, marginLeft: 10, fontWeight: 'bold' },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#f0f0f0',
      paddingVertical: 10,
    },
    tab: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: '#e0e0e0',
    },
    activeTab: {
      backgroundColor: '#ffab00',
    },
    sort: {
      alignSelf: 'flex-end',
      padding: 10,
      marginRight: 16,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: '#fafafa',
      padding: 16,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    thumbnail: {
      width: 50, height: 50,
      borderRadius: 25,
      backgroundColor: '#ccc',
      marginRight: 10,
    },
    cardContent: {
      flex: 1,
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    description: { fontSize: 12, color: '#666' },
  });
  
