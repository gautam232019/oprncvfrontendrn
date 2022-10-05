import 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import React,{useState,useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as firebase from 'firebase'; 
import uuid from 'uuid';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import  Axios  from 'axios';
import mime from 'mime'

const firebaseConfig = {
  apiKey: "AIzaSyAUemanLlpkcg0t_V0tHizoxK5hXc1cdd0",
  authDomain: "opencvpythonapp.firebaseapp.com",
  projectId: "opencvpythonapp",
  storageBucket: "opencvpythonapp.appspot.com",
  messagingSenderId: "1080315567997",
  appId: "1:1080315567997:web:cfb86a2939a7db6aa4f614"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const Stack = createNativeStackNavigator();

export default App = () => {

return (
<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen component={Main} name="Main"/>
    <Stack.Screen component={Home} name="Home"/>
  </Stack.Navigator>
</NavigationContainer>

)
}

const Main=({navigation}) =>{

  const [val, setVal] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');

  const handleError = () => {
    alert('Download was not succcesfull!')
  }

  const uploadImageAsync = async (uri,name) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    var ref = firebase.storage().ref().child(name);
    await ref.put(blob);
    return;
  }

  const uploadOutputImageAsync = async (base64Name,name) => {
    var base = base64Name.slice(2);
    var final = base.slice(0,-1);
    // console.log(base);
    var base64Icon = `data:image/jpg;base64,${final}`;
    // var l = final.slice(-10);
    // console.log(l);
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', base64Icon, true);
      xhr.send(null);
    });
  
    const ref = firebase
      .storage()
      .ref()
      .child(name+'/output');
    const snapshot = await ref.put(blob);
  
    // We're done with the blob, close and release it
    blob.close();
    return;
  }

  const check = async (navigation) => {
    if(link !== ''){
      setLoading(true)
      const fileUri = `${FileSystem.documentDirectory}gautam`;
      const downloadedFile = await FileSystem.downloadAsync(link, fileUri);
      // console.log(downloadedFile);
      if (downloadedFile.status != 200) {
        handleError();
      }

      var formData = new FormData();
      formData.append("file", {
        uri : fileUri,
        type: downloadedFile.headers['content-type'],
        name: "gautam.jpg"
       });
      // console.log(formData);
      
      Axios.post("http://3.17.62.240:80/image",formData)
      .then(res=>{
        // console.log(res.data.output);
        uploadImageAsync(fileUri,downloadedFile.headers['content-type']+'/input');
        uploadOutputImageAsync(res.data.output,downloadedFile.headers['content-type']+'/output');
        navigation.navigate("Home",
        {output: res.data.output}
        )
        setLoading(false);
      }).catch(err=>{
        // console.log(err);
      })
    }
    else if(image){
    setLoading(true)
      var formData = new FormData();
      const newImageUri =  "file:///" + image.uri.split("file:/").join("");
      formData.append("file", {
        uri : newImageUri,
        type: mime.getType(newImageUri),
        name: newImageUri.split("/").pop()
       });
      // console.log(formData);
      
      Axios.post("http://3.17.62.240:80/image",formData)
      .then(res=>{
        // console.log(res.data.output);
        uploadImageAsync(newImageUri,newImageUri.split("/").pop()+"/input");
        uploadOutputImageAsync(res.data.output,newImageUri.split("/").pop()+'/output');
        navigation.navigate("Home",
        {output: res.data.output}
        )
        setLoading(false);
      }).catch(err=>{
        // console.log(err);
      })
    }
    else{
      alert('Please select an image and then proceed!')
    }
  }


  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    // Explore the result
    // console.log(result);

    if (!result.cancelled) {
      setImage(result);
      // console.log(result);
      alert('Image selected')
    }
  }


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result);
      // console.log(result);
      alert('Image is uploaded');
    }
  };
  if(loading){
    return <View style={styles.container}>
        <ActivityIndicator size="large" style={{marginBottom:25}} color={'white'}/>
        <Text style={{ color: 'white', fontSize: 25}}>Loading results</Text>
        <Text style={styles.loginText}>(take less than 1 minute)</Text>
    </View>
  }
  return (
    <View style={styles.container}>
        <Text style={styles.mainTitle}>Plotline Assesment</Text>
      <View style={styles.inputView}>
        {/* <Picker
          selectedValue={val}
          onValueChange={(itemValue,itemIndex) => setVal(itemValue)}> */}
          {/* <Picker.Item label="Select Season" value={1} /> */}
          {/* <Picker.Item label="Growing" value="Growing" /> */}
          {/* <Picker.Item label="Harvesting" value="Harvesting" /> */}
          {/* <Picker.Item label="Season3" value={4} /> */}
        {/* </Picker> */}
        {/* <Text style={styles.mainTitle}></Text> */}
        <TextInput
         style={{height:60}}
         placeholder="Please enter image link"
         onChangeText={l => setLink(l)}
        />
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={openCamera}>
        <Text style={styles.loginText}>CLICK IMAGE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={pickImage}>
        <Text style={styles.loginText}>SELECT IMAGE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn}
        onPress={()=>check(navigation)}
       >
        <Text style={styles.loginText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
}

const Home = (props) =>{
  var base = props.route.params.output.slice(2);
  base.slice(0,-1);
  // console.log(base);
  var base64Icon = `data:image/png;base64,${base}`;
  // console.log(base64Icon);
  return(
  <View style={{flex:1,flexDirection:'column',alignItems:'center',backgroundColor:'#003f5c'}}>
    <Text style={styles.resultTitle}>PLOTLINE</Text>
  
      {base && <Image source={{ uri: base64Icon }} style={{ width: '90%',height:500,marginTop:50,borderWidth:10,borderColor:'white',borderRadius:10 }} />}
      {/* {props.route.params.output.map((x,i)=>(<Text style={{fontSize:25,marginTop:40,
  fontWeight:'bold',
  color:'white'}} key={i}>  {`> ${x}`}</Text>))} */}
    {/* <Text style={{fontSize:30,marginTop:40,
    marginBottom:20,
  fontWeight:'bold',
  color:'white'}}>Condition of the crop</Text> */}

  {/* <Text style={{fontSize:25,marginTop:10,
  fontWeight:'bold',
  color:'white'}}>{props.route.params.output}</Text> */}
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle:{
    fontSize:35,
    fontWeight:'bold',
    color:'white',
    marginBottom:100,
  },
  resultTitle:{
    fontSize:
    35,
    fontWeight:'bold',
    color:'white',
    marginTop:50,
    // marginBottom:20,
  },
  inputView: {
    width: '80%',
    backgroundColor: '#6fd2ed',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  loginBtn: {
    width: '80%',
    backgroundColor: '#fb5b5a',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
    fontWeight:'bold',
  },
});
