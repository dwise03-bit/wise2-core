import React,{useEffect,useState} from 'react';
import {SafeAreaView,ScrollView,View,Text,TextInput,Pressable,StyleSheet} from 'react-native';
import * as SecureStore from 'expo-secure-store';
export default function App(){
 const [url,U]=useState(''),[token,T]=useState(''),[prompt,P]=useState(''),[output,O]=useState(''),[busy,B]=useState(false);
 useEffect(()=>{SecureStore.getItemAsync('hermes-url').then(v=>U(v||''));SecureStore.getItemAsync('hermes-token').then(v=>T(v||''));},[]);
 async function send(){
 if(busy)return;
 if(!/^https:\/\//i.test(url)||!token||!prompt.trim()){O('Enter an HTTPS chat endpoint, access token and message.');return;}
 B(true);O('');
 try{await SecureStore.setItemAsync('hermes-url',url);await SecureStore.setItemAsync('hermes-token',token);
 const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({messages:[{role:'user',content:prompt}],stream:false})});
 if(!r.ok)throw Error('HTTP '+r.status);
 const j=await r.json();O(j.choices?.[0]?.message?.content||JSON.stringify(j,null,2));
 }catch(e){O(String(e.message));}finally{B(false);}
 }
 return <SafeAreaView style={s.root}><ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
 <Text style={s.brand}>WISE² / INTELLIGENCE</Text><Text style={s.title}>HERMES</Text><Text style={s.sub}>MOBILE COMMAND CENTER · DEVELOPMENT</Text>
 <View style={s.card}><Text style={s.label}>SECURE CONNECTION</Text><TextInput style={s.input} value={url} onChangeText={U} autoCapitalize="none" placeholder="HTTPS chat endpoint" placeholderTextColor="#8194ad"/><TextInput style={s.input} value={token} onChangeText={T} secureTextEntry placeholder="Access token" placeholderTextColor="#8194ad"/></View>
 <View style={s.card}><Text style={s.label}>INTELLIGENCE TERMINAL</Text><TextInput style={[s.input,{minHeight:90}]} multiline value={prompt} onChangeText={P} placeholder="Message Hermes" placeholderTextColor="#8194ad"/><Pressable disabled={busy} onPress={send} style={s.button}><Text style={s.buttonText}>{busy?'CONNECTING…':'SEND TO HERMES'}</Text></Pressable><Text selectable style={s.output}>{output}</Text></View>
 <Text style={s.sub}>Second Brain · Living Hive · Commander — integration pending</Text>
 </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#070c16'},body:{padding:24,paddingTop:48,gap:18},brand:{color:'#58a6ff',fontWeight:'800',letterSpacing:3},title:{color:'#fff',fontSize:48,fontWeight:'900'},sub:{color:'#91a5bf',fontSize:12,letterSpacing:1},card:{backgroundColor:'#111e31',borderColor:'#294c77',borderWidth:1,borderRadius:18,padding:18,gap:12},label:{color:'#8fc5ff',fontWeight:'700'},input:{backgroundColor:'#080f1c',color:'#fff',padding:14,borderRadius:10},button:{backgroundColor:'#2478ef',padding:16,borderRadius:10},buttonText:{color:'#fff',fontWeight:'800',textAlign:'center'},output:{color:'#dceaff',lineHeight:23}});
