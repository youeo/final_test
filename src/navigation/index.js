import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 기본 화면들
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

// 로그인&회원가입 화면
import LoginScreen from '../screens/Account/LoginScreen';
import SignupScreen from '../screens/Account/SignupScreen';

// 추천 화면들
import AiRecommend from '../screens/DailyRecommend/AiRecommend';
import TodaysIngredient from '../screens/DailyRecommend/TodaysIngredient';

// 프로필 관련 화면들
import ProfileScreen from '../screens/profile/ProfileScreen';
import SelectAllergyScreen from '../screens/profile/SelectAllergyScreen';
import SelectToolScreen from '../screens/profile/SelectToolScreen';
import SelectIngredientsScreen from '../screens/profile/SelectIngredientsScreen';

// '나의 레시피' 관련 스크린
import MyRecipe from '../screens/MyRecipe/MyRecipe';
import RecipeFormScreen from '../screens/MyRecipe/RecipeFormScreen';
import MyRecipeDetailScreen from '../screens/MyRecipe/MyRecipeDetailScreen';

// '레시피 검색' 관련 스크린
import Select_cateScreen from '../screens/recipe_search/Select_cateScreen';
import Select_ingreScreen from '../screens/recipe_search/Select_ingreScreen';
import Select_mainScreen from '../screens/recipe_search/Select_mainScreen';
import LoadingScreen from '../screens/recipe_search/LoadingScreen';
import RecommendScreen from '../screens/recipe_search/RecommendScreen';

const Stack = createNativeStackNavigator();

function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        
        {/* 기본 화면 */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />

        {/* 추천화면 */}
        <Stack.Screen name="AiRecommend" component={AiRecommend} />
        <Stack.Screen name="TodaysIngredient" component={TodaysIngredient} />
        
        {/* 프로필 화면 */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SelectAllergyScreen" component={SelectAllergyScreen} />
        <Stack.Screen name="SelectToolScreen" component={SelectToolScreen} />
        <Stack.Screen name="SelectIngredientsScreen" component={SelectIngredientsScreen} />


        {/* '레시피 검색' 관련 스크린 */}
        <Stack.Screen name="Select_cate" component={Select_cateScreen} />
        <Stack.Screen name="Select_ingre" component={Select_ingreScreen} />
        <Stack.Screen name="Select_main" component={Select_mainScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Recommend" component={RecommendScreen} />
        
        {/* '나의 레시피' 관련 스크린 */}
        <Stack.Screen name="MyRecipe" component={MyRecipe} />
        <Stack.Screen name="RecipeFormScreen" component={RecipeFormScreen} />
        <Stack.Screen name="MyRecipeDetailScreen" component={MyRecipeDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;