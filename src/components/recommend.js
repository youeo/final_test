import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Pressable, Image, TextInput } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import MasonryList from '@react-native-seoul/masonry-list';
import { CachedImage } from '../helpers/image';
import axios from 'axios';
import Loading from './loading';
import { StatusBar } from 'expo-status-bar'
import { AntDesign } from '@expo/vector-icons';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Recommend() {

    const [showModal, setShowModal] = useState(true);
    const [activeTab, setActiveTab] = useState('possible');
    const navigation = useNavigation();

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

              <ScrollView
                style={{flex: 1}} className="mx-5 space-y-4"
                showsHorizontalScrollIndicator={true}
                >
                <View style={{flex: 1, flexDirection: 'row', backgroundColor: '#ddd', borderWidth: 1, borderColor: '#bab8b8'}} className="space-x-2 rounded-2xl px-3 py-3">
                  <View style={{flex: 0.3}}>
                    // .jpg 이름 영어로 수정
                    <Image source={require('../../assets/images/kimchirice.jpg')}
                     style={{width: 80, height: 80}}
                     className="rounded-full" />
                  </View>
                  <View style={{flex: 0.6}} className="space-y-2">
                    <Text className="font-semibold text-lg">김치볶음밥</Text>
                    <Text className="text-sm">고소하고 달달한 맛의 김치볶음밥...</Text>
                  </View>
                  <View style={{flex: 0.1}} className="items-end justify-end">
                    <AntDesign name="doubleright" size={hp(2)} color="black" onPress={false}/>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row', backgroundColor: '#ddd', borderWidth: 1, borderColor: '#bab8b8'}} className="space-x-2 rounded-2xl px-3 py-3">
                  <View style={{flex: 0.3}}>
                    <Image source={require('../../assets/images/kimchisoup.jpg')}
                     style={{width: 80, height: 80}}
                     className="rounded-full" />
                  </View>
                  <View style={{flex: 0.6}} className="space-y-2">
                    <Text className="font-semibold text-lg">김치찌개</Text>
                    <Text className="text-sm">칼칼하고 진한 집밥 김치찌개 레시피...</Text>
                  </View>
                  <View style={{flex: 0.1}} className="items-end justify-end">
                    <AntDesign name="doubleright" size={hp(2)} color="black" onPress={false}/>
                  </View>
                </View>
              </ScrollView>

              {/* 레시피 리스트 */}
              {/* <FlatList
              data={filteredRecipes}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 10 }}
              /> */}
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
  
