import { View, Text, Pressable, Image, FlatList } from 'react-native'
import React from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import { mealData } from '../constants';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Loading from './loading';
import { CachedImage } from '../helpers/image';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

// 메인에서 오늘의 추천 레시피 보여주기
// 기존에 있던 오늘의 추천 레시피 제목 및 버튼 삭제 후 새로 등록

/*export default function Recipes({categories, meals}) {
    const navigation = useNavigation();
  return (
    <View className="space-y-3 -mb-3">
        <View className="flex-row justify-between items-center pt-2 pb-2 bg-ye">
            <Text style={{fontSize: hp(2)}} className="mx-4 font-semibold text-gr">오늘의 추천 레시피</Text>
            <AntDesign paddingRight={16} name="doubleright" size={hp(2)} color="#43794b" onPress={()=> navigation.navigate('SecondScreen')}/>
        </View>
      <View className="pt-3 mx-4">
        {
            categories.length==0 || meals.length==0?(
                <Loading size="large" className="mt-20" />
            ): (
                <FlatList
                    horizontal
                    data={meals.slice(0,5)}
                    renderItem={({item, i}) => (
                        <RecipeCard
                        item={item}
                        index={i}
                        navigation={navigation}
                        />
                    )}
                    keyExtractor={(item) => item.idMeal}
                    initialNumToRender={5}
                    //마지막 어디에 도달하면 onEndReached 행동을 수행할지 최대가 1 (클수록 빨리 함)
                    onEndReachedThreshold={0.8}
                    windowSize={2}
                    showsHorizontalScrollIndicator={true}
                />
            )
        }
            
      </View>
    </View>
  )
}*/

export default function Recipes({categories, meals}) {
    const navigation = useNavigation();
    return (
        <View className="space-y-3 -mb-3">
            {/* 제목과 버튼 제거됨 */}

            <View className="pt-3 mx-4">
                {
                    categories.length === 0 || meals.length === 0 ? (
                        <Loading size="large" className="mt-20" />
                    ) : (
                        <FlatList
                            horizontal
                            data={meals.slice(0, 5)}
                            renderItem={({item, i}) => (
                                <RecipeCard
                                    item={item}
                                    index={i}
                                    navigation={navigation}
                                />
                            )}
                            keyExtractor={(item) => item.idMeal}
                            initialNumToRender={5}
                            onEndReachedThreshold={0.8}
                            windowSize={2}
                            showsHorizontalScrollIndicator={true}
                        />
                    )
                }
            </View>
        </View>
    );
}


const RecipeCard = ({item, index, navigation})=>{
    let isEven = index%2==0;
    return (
        <Animated.View entering={FadeInDown.delay(index*100).duration(600).springify().damping(12)}>
            <Pressable
                style={{width: '100%', paddingLeft: isEven? 0:8, paddingRight: isEven?8:0}}
                className="flex justify-center mb-4 space-y-1"
                onPress={()=> navigation.navigate('RecipeDetail', {...item})}
            >
                {/* <Image 
                    source={{uri: item.strMealThumb}}
                    style={{width: '100%', height: index%3==0? hp(25): hp(35), borderRadius: 35}}
                    className="bg-black/5"
                /> */}
                <CachedImage
                     uri= {item.strMealThumb}
                     style={{width: '100%', height: index%3==0? hp(20): hp(20), borderRadius: 35}}
                     className="bg-black/5"
                     sharedTransitionTag={item.strMeal}
                />
                <Text style={{fontSize: hp(1.5)}} className="font-semibold ml-2 text-neutral-600">
                    {
                        item.strMeal.length>20? item.strMeal.slice(0,20)+'...': item.strMeal
                    }
                </Text>
            </Pressable>
        </Animated.View>
    )
}