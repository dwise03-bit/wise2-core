package com.cjays.autorecon

import android.os.Bundle
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID
import java.io.File

private val Ink = Color(0xFFF6F8FA)
private val Muted = Color(0xFFB4BFCA)
private val Bg = Color(0xFF05080C)
private val Surface = Color(0xFF0C1219)
private val Raised = Color(0xFF111A24)
private val Divider = Color(0xFF283442)
private val Blue = Color(0xFF0878F9)
private val Gold = Color(0xFFD9A62E)
private val Green = Color(0xFF35C76F)

@Serializable data class Customer(val id:String=UUID.randomUUID().toString(), val name:String, val phone:String, val email:String="")
@Serializable data class Vehicle(val id:String=UUID.randomUUID().toString(), val vin:String, val year:String, val make:String, val model:String, val color:String="", val customerId:String="")
@Serializable data class Job(val id:String=UUID.randomUUID().toString(), val vehicleId:String, val service:String, val status:String="In Progress", val price:String="", val checklist:List<Boolean> = List(6){false}, val notes:String="", val paymentMethod:String="", val paidAmount:String="", val beforePhotos:List<String> = emptyList(), val afterPhotos:List<String> = emptyList())
@Serializable data class AppData(val customers:List<Customer> = emptyList(), val vehicles:List<Vehicle> = emptyList(), val jobs:List<Job> = emptyList())

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { CJaysTheme { CJaysRoot() } }
    }
}

@Composable private fun CJaysTheme(content:@Composable () -> Unit) {
    val scheme = darkColorScheme(primary=Blue, secondary=Gold, background=Bg, surface=Surface, onPrimary=Color.White, onBackground=Ink, onSurface=Ink, outline=Divider, error=Color(0xFFFF5A64))
    MaterialTheme(colorScheme=scheme, typography=Typography(), content=content)
}

private enum class SyncState { ONLINE, OFFLINE, SYNCING, ERROR }
private val LocalSyncState = compositionLocalOf { SyncState.OFFLINE }

@Composable private fun rememberData(session:Wise2Session,onSession:(Wise2Session)->Unit,onSync:(SyncState)->Unit): MutableState<AppData> {
    val context = androidx.compose.ui.platform.LocalContext.current
    val prefs = remember { context.getSharedPreferences("cjays_data", Context.MODE_PRIVATE) }
    val initial = remember { runCatching { Json.decodeFromString<AppData>(prefs.getString("data", "") ?: "") }.getOrDefault(AppData()) }
    val state = remember { mutableStateOf(initial) }
    LaunchedEffect(state.value,session.accessToken) {
        prefs.edit().putString("data", Json.encodeToString(state.value)).apply()
        delay(700)
        onSync(SyncState.SYNCING)
        Wise2Client.sync(session,state.value).onSuccess { (merged,freshSession) -> if(freshSession!=session)onSession(freshSession);if(merged!=state.value)state.value=merged;onSync(SyncState.ONLINE) }.onFailure { error -> onSync(if(error is java.io.IOException)SyncState.OFFLINE else SyncState.ERROR) }
    }
    return state
}

private enum class Tab(val label:String, val icon:ImageVector) { Dashboard("Dashboard",Icons.Default.Home), Jobs("Jobs",Icons.Default.Work), Scan("Scan",Icons.Default.QrCodeScanner), Customers("Customers",Icons.Default.People), More("More",Icons.Default.Menu) }

@Composable private fun CJaysRoot(){
    val context=androidx.compose.ui.platform.LocalContext.current
    val store=remember{SecureSessionStore(context)}
    var session by remember{mutableStateOf(store.load())}
    if(session==null){LoginScreen{store.save(it);session=it}}else CJaysApp(session!!,{store.save(it);session=it}){store.clear();session=null}
}

@Composable private fun LoginScreen(onLogin:(Wise2Session)->Unit){
    var email by rememberSaveable{mutableStateOf("")};var password by rememberSaveable{mutableStateOf("")};var error by remember{mutableStateOf("")};var loading by remember{mutableStateOf(false)};val scope=rememberCoroutineScope()
    Column(Modifier.fillMaxSize().background(Bg).padding(28.dp),verticalArrangement=Arrangement.Center){
        Box(Modifier.size(58.dp).background(Gold,RoundedCornerShape(14.dp)),contentAlignment=Alignment.Center){Text("C",color=Bg,fontSize=30.sp,fontWeight=FontWeight.Black)}
        Text("CJAYS",color=Ink,fontSize=34.sp,fontWeight=FontWeight.Black,modifier=Modifier.padding(top=18.dp));Text("AUTO RECON SOLUTIONS · POWERED BY WISE²",color=Blue,fontSize=12.sp,fontWeight=FontWeight.Bold)
        Text("Sign in to your Wise² client workspace",color=Ink,fontSize=18.sp,fontWeight=FontWeight.Bold,modifier=Modifier.padding(top=34.dp,bottom=14.dp))
        Field("Email",email,{email=it},KeyboardType.Email);Spacer(Modifier.height(12.dp));OutlinedTextField(password,{password=it},Modifier.fillMaxWidth(),label={Text("Password")},singleLine=true,visualTransformation=PasswordVisualTransformation(),shape=RoundedCornerShape(12.dp))
        if(error.isNotBlank())Text(error,color=MaterialTheme.colorScheme.error,modifier=Modifier.padding(top=10.dp))
        Button(onClick={loading=true;error="";scope.launch{Wise2Client.login(email.trim(),password).onSuccess(onLogin).onFailure{error=it.message?:"Unable to sign in"};loading=false}},enabled=!loading&&email.isNotBlank()&&password.isNotBlank(),modifier=Modifier.padding(top=18.dp).fillMaxWidth().height(54.dp),shape=RoundedCornerShape(12.dp)){if(loading)CircularProgressIndicator(Modifier.size(20.dp),strokeWidth=2.dp,color=Color.White)else Text("SIGN IN",fontWeight=FontWeight.Black)}
        Text("Your records remain on this device while offline and sync when Wise² reconnects.",color=Muted,fontSize=12.sp,modifier=Modifier.padding(top=16.dp))
    }
}

@Composable private fun CJaysApp(session:Wise2Session,onSession:(Wise2Session)->Unit,onLogout:()->Unit) {
    var tab by rememberSaveable { mutableStateOf(Tab.Dashboard) }
    var syncState by remember{mutableStateOf(SyncState.SYNCING)}
    val data = rememberData(session,onSession){syncState=it}
    CompositionLocalProvider(LocalSyncState provides syncState){Scaffold(containerColor=Bg, bottomBar={
        NavigationBar(containerColor=Surface, tonalElevation=0.dp) {
            Tab.entries.forEach { item ->
                NavigationBarItem(selected=tab==item, onClick={tab=item}, icon={
                    if(item==Tab.Scan) Box(Modifier.size(54.dp).background(Blue,CircleShape), contentAlignment=Alignment.Center){ Icon(item.icon,null,tint=Color.White,modifier=Modifier.size(28.dp)) }
                    else Icon(item.icon,null)
                }, label={Text(item.label,fontSize=10.sp)}, colors=NavigationBarItemDefaults.colors(selectedIconColor=Blue,selectedTextColor=Blue,unselectedIconColor=Muted,unselectedTextColor=Muted,indicatorColor=Color.Transparent))
            }
        }
    }) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            when(tab) {
                Tab.Dashboard -> Dashboard(data.value,{tab=Tab.Scan},{tab=Tab.Jobs},{tab=Tab.Customers})
                Tab.Jobs -> JobsScreen(data.value,session.accessToken) { updated -> data.value=data.value.copy(jobs=data.value.jobs.map{if(it.id==updated.id)updated else it}) }
                Tab.Scan -> ScanFlow(data.value) { data.value=it }
                Tab.Customers -> CustomersScreen(data.value) { data.value=data.value.copy(customers=data.value.customers+it) }
                Tab.More -> MoreScreen(session.accessToken,onLogout)
            }
        }
    }}
}

@Composable private fun PageHeader(title:String, subtitle:String?=null) {
    val sync=LocalSyncState.current
    Column(Modifier.fillMaxWidth().padding(horizontal=20.dp, vertical=18.dp)) {
        Row(verticalAlignment=Alignment.CenterVertically){
            Box(Modifier.size(30.dp).background(Gold,RoundedCornerShape(8.dp)),contentAlignment=Alignment.Center){Text("C",color=Bg,fontWeight=FontWeight.Black)}
            Spacer(Modifier.width(10.dp)); Text("CJAYS",fontWeight=FontWeight.Black,fontSize=18.sp); Spacer(Modifier.weight(1f))
            val syncColor=when(sync){SyncState.ONLINE->Green;SyncState.SYNCING->Blue;SyncState.OFFLINE->Gold;SyncState.ERROR->MaterialTheme.colorScheme.error};Surface(color=syncColor.copy(alpha=.14f),shape=RoundedCornerShape(20.dp)){Text("● ${sync.name}",color=syncColor,fontSize=11.sp,modifier=Modifier.padding(horizontal=10.dp,vertical=6.dp))}
        }
        Spacer(Modifier.height(20.dp)); Text(title,fontSize=28.sp,fontWeight=FontWeight.Black)
        subtitle?.let { Text(it,color=Muted,fontSize=14.sp,modifier=Modifier.padding(top=4.dp)) }
    }
}

@Composable private fun Dashboard(data:AppData,onScan:()->Unit,onJobs:()->Unit,onCustomers:()->Unit) {
    LazyColumn(contentPadding=PaddingValues(bottom=24.dp)) {
        item { PageHeader("Dashboard","Your operation, at a glance") }
        item {
            Row(Modifier.padding(horizontal=20.dp).fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(10.dp)) {
                Metric("ACTIVE JOBS",data.jobs.count{it.status!="Completed"}.toString(),Modifier.weight(1f)); Metric("CUSTOMERS",data.customers.size.toString(),Modifier.weight(1f))
            }
            Row(Modifier.padding(horizontal=20.dp,vertical=10.dp).fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(10.dp)) {
                Metric("VEHICLES",data.vehicles.size.toString(),Modifier.weight(1f)); Metric("COMPLETED",data.jobs.count{it.status=="Completed"}.toString(),Modifier.weight(1f))
            }
        }
        item { Text("Quick actions",fontSize=18.sp,fontWeight=FontWeight.Bold,modifier=Modifier.padding(20.dp,16.dp,20.dp,10.dp)) }
        item { Row(Modifier.padding(horizontal=20.dp),horizontalArrangement=Arrangement.spacedBy(10.dp)){ Quick("SCAN VEHICLE",Icons.Default.QrCodeScanner,true,onScan,Modifier.weight(1.4f)); Quick("NEW JOB",Icons.Default.Add,false,onScan,Modifier.weight(1f)) } }
        item { Row(Modifier.padding(20.dp,10.dp),horizontalArrangement=Arrangement.spacedBy(10.dp)){ Quick("CUSTOMER",Icons.Default.PersonAdd,false,onCustomers,Modifier.weight(1f)); Quick("JOBS",Icons.Default.Work,false,onJobs,Modifier.weight(1f)) } }
        item { Text("Recent jobs",fontSize=18.sp,fontWeight=FontWeight.Bold,modifier=Modifier.padding(20.dp,12.dp,20.dp,8.dp)) }
        if(data.jobs.isEmpty()) item { EmptyState("No jobs yet","Scan a vehicle to start the first job.",Icons.Default.CarRepair,onScan) }
        else items(data.jobs.take(4)) { job -> JobRow(job,data) }
    }
}

@Composable private fun Metric(label:String,value:String,modifier:Modifier=Modifier){ Surface(modifier=modifier.height(100.dp),color=Raised,shape=RoundedCornerShape(14.dp),border=androidx.compose.foundation.BorderStroke(1.dp,Divider)){Column(Modifier.padding(16.dp)){Text(label,color=Muted,fontSize=11.sp);Spacer(Modifier.height(8.dp));Text(value,fontSize=30.sp,fontWeight=FontWeight.Black)}} }
@Composable private fun Quick(label:String,icon:ImageVector,primary:Boolean,onClick:()->Unit,modifier:Modifier=Modifier){ Button(onClick=onClick,modifier=modifier.height(58.dp),shape=RoundedCornerShape(12.dp),colors=ButtonDefaults.buttonColors(containerColor=if(primary)Blue else Raised),border=if(primary)null else androidx.compose.foundation.BorderStroke(1.dp,Divider),contentPadding=PaddingValues(horizontal=10.dp)){Icon(icon,null,modifier=Modifier.size(20.dp));Spacer(Modifier.width(6.dp));Text(label,fontWeight=FontWeight.Bold,fontSize=11.sp,maxLines=1)} }

@Composable private fun ScanFlow(data:AppData,onChange:(AppData)->Unit) {
    var vin by rememberSaveable { mutableStateOf("") }; var stage by rememberSaveable { mutableIntStateOf(0) }; var error by remember { mutableStateOf("") }
    var decoding by remember { mutableStateOf(false) }; val scope = rememberCoroutineScope()
    var year by rememberSaveable { mutableStateOf("") }; var make by rememberSaveable { mutableStateOf("") }; var model by rememberSaveable { mutableStateOf("") }
    var name by rememberSaveable { mutableStateOf("") }; var phone by rememberSaveable { mutableStateOf("") }; var service by rememberSaveable { mutableStateOf("Full Detail") }; var price by rememberSaveable { mutableStateOf("") }
    var showScanner by rememberSaveable { mutableStateOf(true) }
    LazyColumn(contentPadding=PaddingValues(bottom=24.dp)) {
        item { PageHeader(if(stage==0)"Scan vehicle" else "New job", when(stage){0->"VIN barcode, QR code, or manual entry";1->"Vehicle details";2->"Customer";else->"Service and payment"}) }
        item {
            Column(Modifier.padding(horizontal=20.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
                when(stage){
                    0->{
                        if(showScanner) BarcodeScannerView(onDetected={ detected -> vin=detected;showScanner=false },onManual={showScanner=false})
                        else OutlinedButton(onClick={showScanner=true},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.QrCodeScanner,null);Spacer(Modifier.width(8.dp));Text("OPEN QR / VIN CAMERA")}
                        Field("VIN",vin,{vin=it.uppercase().filter{c->c.isLetterOrDigit()}.take(17)},KeyboardType.Ascii)
                        Button(onClick={ if(extractVin(vin)!=vin){error="Enter a valid 17-character VIN without I, O, or Q."} else { val found=data.vehicles.find{it.vin==vin}; if(found!=null){year=found.year;make=found.make;model=found.model;data.customers.find{it.id==found.customerId}?.let{name=it.name;phone=it.phone};error="VEHICLE FOUND — customer and history loaded";stage=1} else { decoding=true;error="";scope.launch { VinDecoder.decode(vin).onSuccess{decoded->year=decoded.ModelYear;make=decoded.Make;model=decoded.Model}.onFailure{error="VIN decoding unavailable. Enter vehicle details manually."};decoding=false;stage=1 } } } },enabled=!decoding,modifier=Modifier.fillMaxWidth().height(54.dp),shape=RoundedCornerShape(12.dp)){if(decoding)CircularProgressIndicator(Modifier.size(20.dp),strokeWidth=2.dp,color=Color.White)else Text("SEARCH & DECODE VIN",fontWeight=FontWeight.Black)}
                    }
                    1->{ Field("Year",year,{year=it},KeyboardType.Number);Field("Make",make,{make=it});Field("Model",model,{model=it}); Primary("CONTINUE TO CUSTOMER"){if(make.isBlank()||model.isBlank())error="Make and model are required." else {error="";stage=2}} }
                    2->{ Field("Customer name",name,{name=it});Field("Phone",phone,{phone=it},KeyboardType.Phone);Primary("CONTINUE TO JOB"){if(name.isBlank()||phone.isBlank())error="Customer name and phone are required." else {error="";stage=3}} }
                    3->{ Field("Service",service,{service=it});Field("Price",price,{price=it},KeyboardType.Decimal);Primary("START JOB"){
                        val existingVehicle=data.vehicles.find{it.vin==vin}; val existingCustomer=data.customers.find{it.phone==phone}; val customer=existingCustomer?:Customer(name=name,phone=phone)
                        val vehicle=existingVehicle?:Vehicle(vin=vin,year=year,make=make,model=model,customerId=customer.id)
                        val job=Job(vehicleId=vehicle.id,service=service,price=price)
                        onChange(data.copy(customers=if(existingCustomer==null)data.customers+customer else data.customers,vehicles=if(existingVehicle==null)data.vehicles+vehicle else data.vehicles,jobs=data.jobs+job)); stage=0;vin="";name="";phone="";year="";make="";model="";price="";showScanner=true
                    }}
                }
                if(error.isNotBlank()) Text(error,color=MaterialTheme.colorScheme.error,fontSize=13.sp)
                if(stage>0) TextButton(onClick={stage--},modifier=Modifier.align(Alignment.Start)){Text("Back")}
            }
        }
    }
}

@Composable private fun Field(label:String,value:String,onChange:(String)->Unit,type:KeyboardType=KeyboardType.Text){ OutlinedTextField(value,onChange,Modifier.fillMaxWidth(),label={Text(label)},singleLine=true,shape=RoundedCornerShape(12.dp),keyboardOptions=KeyboardOptions(keyboardType=type,capitalization=KeyboardCapitalization.Words),colors=OutlinedTextFieldDefaults.colors(focusedBorderColor=Blue,unfocusedBorderColor=Divider,focusedContainerColor=Surface,unfocusedContainerColor=Surface)) }
@Composable private fun Primary(label:String,onClick:()->Unit){Button(onClick,Modifier.fillMaxWidth().height(54.dp),shape=RoundedCornerShape(12.dp)){Text(label,fontWeight=FontWeight.Black)}}

@Composable private fun JobsScreen(data:AppData,token:String,onUpdate:(Job)->Unit){
    var selectedId by rememberSaveable { mutableStateOf<String?>(null) }
    val selected=data.jobs.find{it.id==selectedId}
    if(selected!=null){JobWorkflow(selected,data,token,onUpdate,{selectedId=null});return}
    LazyColumn(contentPadding=PaddingValues(bottom=24.dp)){
        item{PageHeader("Jobs","Track work from check-in to completion")}
        if(data.jobs.isEmpty())item{EmptyState("No active jobs","Use Scan to create a vehicle and start a job.",Icons.Default.Work,{})}
        else items(data.jobs.reversed()){job->JobRow(job,data){selectedId=job.id}}
    }
}

@Composable private fun JobWorkflow(job:Job,data:AppData,token:String,onUpdate:(Job)->Unit,onBack:()->Unit){
    val context=androidx.compose.ui.platform.LocalContext.current
    var current by remember(job){mutableStateOf(job)}
    var pendingUri by remember{mutableStateOf<Uri?>(null)}
    var photoType by remember{mutableStateOf("before")}
    var message by remember{mutableStateOf("")}
    var aiSuggestion by remember{mutableStateOf("")};var aiBusy by remember{mutableStateOf(false)};var aiTask by remember{mutableStateOf("quality_review")};val scope=rememberCoroutineScope()
    val camera=rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()){ok->if(ok){val path=pendingUri.toString();current=if(photoType=="before")current.copy(beforePhotos=current.beforePhotos+path)else current.copy(afterPhotos=current.afterPhotos+path);onUpdate(current);message="Photo saved to this job."}}
    fun takePhoto(type:String){val dir=File(context.filesDir,"job-photos").apply{mkdirs()};val file=File(dir,"${job.id}-${type}-${System.currentTimeMillis()}.jpg");val uri=FileProvider.getUriForFile(context,"${context.packageName}.files",file);pendingUri=uri;photoType=type;camera.launch(uri)}
    val checklistNames=listOf("Arrival inspection","Exterior","Interior","Glass & trim","Quality check","Customer handoff")
    LazyColumn(contentPadding=PaddingValues(bottom=28.dp)){
        item{Row(Modifier.padding(12.dp,10.dp),verticalAlignment=Alignment.CenterVertically){IconButton(onClick=onBack){Icon(Icons.Default.ArrowBack,"Back")};Text("Job workflow",fontSize=22.sp,fontWeight=FontWeight.Black)}}
        item{JobRow(current,data,{})}
        item{SectionTitle("Before photos");PhotoAction("CAPTURE BEFORE PHOTO",current.beforePhotos.size){takePhoto("before")}}
        item{SectionTitle("Service checklist")}
        items(checklistNames.size){index->Row(Modifier.fillMaxWidth().clickable{val next=current.checklist.toMutableList();next[index]=!next[index];current=current.copy(checklist=next);onUpdate(current)}.padding(horizontal=20.dp,vertical=10.dp),verticalAlignment=Alignment.CenterVertically){Checkbox(current.checklist.getOrElse(index){false},{val next=current.checklist.toMutableList();next[index]=it;current=current.copy(checklist=next);onUpdate(current)});Text(checklistNames[index],Modifier.padding(start=8.dp))}}
        item{SectionTitle("Work notes");OutlinedTextField(current.notes,{current=current.copy(notes=it);onUpdate(current)},Modifier.padding(horizontal=20.dp).fillMaxWidth(),minLines=3,label={Text("Technician notes")},shape=RoundedCornerShape(12.dp))}
        item{SectionTitle("After photos");PhotoAction("CAPTURE AFTER PHOTO",current.afterPhotos.size){takePhoto("after")}}
        item{SectionTitle("Wise² AI copilot");Column(Modifier.padding(horizontal=20.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){Text("Choose what Craig needs next",color=Muted,fontSize=12.sp);Row(horizontalArrangement=Arrangement.spacedBy(6.dp)){listOf("quality_review" to "QC","summary" to "SUMMARY","follow_up" to "FOLLOW-UP","checklist" to "CHECKLIST").forEach{(task,label)->FilterChip(selected=aiTask==task,onClick={aiTask=task},label={Text(label,fontSize=10.sp)})}};Button(onClick={aiBusy=true;message="";scope.launch{Wise2Client.aiAssist(token,current.id,aiTask).onSuccess{aiSuggestion=it.suggestion}.onFailure{message=it.message?:"AI unavailable"};aiBusy=false}},enabled=!aiBusy,modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.AutoAwesome,null);Spacer(Modifier.width(8.dp));Text(if(aiBusy)"WISE² IS THINKING…" else "ASK WISE²")};if(aiSuggestion.isNotBlank()){Surface(color=Raised,shape=RoundedCornerShape(12.dp),border=androidx.compose.foundation.BorderStroke(1.dp,Blue.copy(alpha=.5f))){Text(aiSuggestion,modifier=Modifier.padding(14.dp),color=Ink)};OutlinedButton(onClick={scope.launch{Wise2Client.saveToDrive(token,"CJAYS-${current.id}-${aiTask}.txt",aiSuggestion).onSuccess{message="Approved AI result saved to Google Drive."}.onFailure{message=it.message?:"Drive export failed"}}},Modifier.fillMaxWidth()){Icon(Icons.Default.AddToDrive,null);Spacer(Modifier.width(8.dp));Text("APPROVE & SAVE TO DRIVE")};Text("Grounded in this job. Human approval is required before any external action.",color=Muted,fontSize=11.sp)}}}
        item{SectionTitle("Payment & invoice");Column(Modifier.padding(horizontal=20.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){Field("Paid amount",current.paidAmount,{current=current.copy(paidAmount=it);onUpdate(current)},KeyboardType.Decimal);Field("Payment method",current.paymentMethod,{current=current.copy(paymentMethod=it);onUpdate(current)});Button(onClick={onUpdate(current);message="Payment recorded. No electronic charge was processed."},Modifier.fillMaxWidth()){Text("RECORD PAYMENT")};OutlinedButton(onClick={runCatching{InvoiceGenerator.createAndShare(context,invoiceFor(current,data))}.onSuccess{message="Invoice ready to share."}.onFailure{message=it.message?:"Could not create invoice"}},modifier=Modifier.fillMaxWidth()){Icon(Icons.Default.ReceiptLong,null);Spacer(Modifier.width(8.dp));Text("CREATE & SHARE PDF INVOICE")}}}
        item{if(message.isNotBlank())Text(message,color=Green,modifier=Modifier.padding(20.dp));Button(onClick={if(current.checklist.all{it}&&current.beforePhotos.isNotEmpty()&&current.afterPhotos.isNotEmpty()){current=current.copy(status="Completed");onUpdate(current);message="Job completed and saved."}else message="Complete the checklist and capture before and after photos first."},enabled=current.status!="Completed",modifier=Modifier.padding(20.dp).fillMaxWidth().height(54.dp),shape=RoundedCornerShape(12.dp)){Icon(Icons.Default.CheckCircle,null);Spacer(Modifier.width(8.dp));Text(if(current.status=="Completed")"COMPLETED" else "COMPLETE JOB",fontWeight=FontWeight.Black)}}
    }
}

@Composable private fun SectionTitle(value:String){Text(value,fontSize=18.sp,fontWeight=FontWeight.Bold,modifier=Modifier.padding(20.dp,20.dp,20.dp,10.dp))}
@Composable private fun PhotoAction(label:String,count:Int,onClick:()->Unit){Button(onClick,Modifier.padding(horizontal=20.dp).fillMaxWidth().height(52.dp),shape=RoundedCornerShape(12.dp),colors=ButtonDefaults.buttonColors(containerColor=Raised),border=androidx.compose.foundation.BorderStroke(1.dp,Divider)){Icon(Icons.Default.CameraAlt,null);Spacer(Modifier.width(8.dp));Text("$label · $count",maxLines=1)}}
@Composable private fun JobRow(job:Job,data:AppData,onClick:()->Unit={}){val v=data.vehicles.find{it.id==job.vehicleId};Surface(color=Raised,shape=RoundedCornerShape(14.dp),border=androidx.compose.foundation.BorderStroke(1.dp,Divider),modifier=Modifier.padding(horizontal=20.dp,vertical=5.dp).fillMaxWidth().clickable(onClick=onClick)){Column(Modifier.padding(16.dp)){Row{Text(v?.let{"${it.year} ${it.make} ${it.model}"}?:"Vehicle",fontWeight=FontWeight.Bold,modifier=Modifier.weight(1f));Status(job.status)};Text(job.service,color=Muted,modifier=Modifier.padding(top=6.dp));Text(v?.vin?:"",color=Muted,fontSize=11.sp);if(job.price.isNotBlank())Text("$${job.price}",color=Gold,fontWeight=FontWeight.Bold,modifier=Modifier.padding(top=8.dp))}}}
@Composable private fun Status(value:String){val c=if(value=="Completed")Green else Gold;Surface(color=c.copy(alpha=.14f),shape=RoundedCornerShape(20.dp)){Text(value,color=c,fontSize=11.sp,fontWeight=FontWeight.Bold,modifier=Modifier.padding(horizontal=9.dp,vertical=5.dp))}}

@Composable private fun CustomersScreen(data:AppData,onAdd:(Customer)->Unit){var adding by remember{mutableStateOf(false)};var name by remember{mutableStateOf("")};var phone by remember{mutableStateOf("")};LazyColumn(contentPadding=PaddingValues(bottom=24.dp)){item{PageHeader("Customers","Searchable customer and vehicle history")};item{Column(Modifier.padding(horizontal=20.dp)){if(adding){Field("Customer name",name,{name=it});Spacer(Modifier.height(10.dp));Field("Phone",phone,{phone=it},KeyboardType.Phone);Spacer(Modifier.height(10.dp));Primary("SAVE CUSTOMER"){if(name.isNotBlank()&&phone.isNotBlank()){onAdd(Customer(name=name,phone=phone));name="";phone="";adding=false}}}else Primary("ADD CUSTOMER"){adding=true}}};if(data.customers.isEmpty())item{EmptyState("No customers yet","Add a customer or create one through the scan workflow.",Icons.Default.People,{adding=true})}else items(data.customers.reversed()){c->Surface(color=Raised,shape=RoundedCornerShape(12.dp),modifier=Modifier.padding(horizontal=20.dp,vertical=5.dp).fillMaxWidth()){Row(Modifier.padding(16.dp),verticalAlignment=Alignment.CenterVertically){Box(Modifier.size(42.dp).background(Blue.copy(alpha=.18f),CircleShape),contentAlignment=Alignment.Center){Text(c.name.take(1).uppercase(),color=Blue,fontWeight=FontWeight.Black)};Column(Modifier.padding(start=12.dp)){Text(c.name,fontWeight=FontWeight.Bold);Text(c.phone,color=Muted,fontSize=13.sp)}}}}}}

@Composable private fun MoreScreen(token:String,onLogout:()->Unit){val context=androidx.compose.ui.platform.LocalContext.current;val scope=rememberCoroutineScope();var googleStatus by remember{mutableStateOf("CHECKING")};var googleAccount by remember{mutableStateOf("")};LaunchedEffect(token){Wise2Client.googleStatus(token).onSuccess{googleStatus=if(it.connected)"CONNECTED" else "NOT CONNECTED";googleAccount=it.accountName?:""}.onFailure{googleStatus="UNAVAILABLE"}};val entries=listOf("Vehicles" to Icons.Default.DirectionsCar,"Services" to Icons.Default.Build,"Inventory" to Icons.Default.Inventory,"Reports" to Icons.Default.Insights,"Team" to Icons.Default.Groups,"Sync Status" to Icons.Default.CloudSync,"Settings" to Icons.Default.Settings,"Privacy & Terms" to Icons.Default.Policy);LazyColumn{item{PageHeader("More","Business tools and account settings")};item{Surface(color=Raised,shape=RoundedCornerShape(14.dp),border=androidx.compose.foundation.BorderStroke(1.dp,Divider),modifier=Modifier.padding(20.dp,4.dp).fillMaxWidth()){Column(Modifier.padding(16.dp)){Row(verticalAlignment=Alignment.CenterVertically){Icon(Icons.Default.AddToDrive,null,tint=Blue);Column(Modifier.padding(start=12.dp).weight(1f)){Text("Google Workspace",fontWeight=FontWeight.Bold);Text(if(googleAccount.isNotBlank())googleAccount else googleStatus,color=Muted,fontSize=12.sp)}};Text("Calendar · Drive · Gmail",color=Muted,fontSize=12.sp,modifier=Modifier.padding(top=10.dp));Button(onClick={scope.launch{Wise2Client.googleAuthorize(token).onSuccess{context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(it)))}.onFailure{googleStatus=it.message?:"Unable to connect"}}},modifier=Modifier.padding(top=12.dp).fillMaxWidth()){Text(if(googleStatus=="CONNECTED")"RECONNECT GOOGLE" else "CONNECT GOOGLE")}}}};items(entries){(label,icon)->Row(Modifier.fillMaxWidth().clickable{}.padding(horizontal=20.dp,vertical=16.dp),verticalAlignment=Alignment.CenterVertically){Icon(icon,null,tint=if(label=="Sync Status")Green else Muted);Text(label,Modifier.padding(start=16.dp).weight(1f),fontWeight=FontWeight.Medium);Icon(Icons.Default.ChevronRight,null,tint=Muted)};HorizontalDivider(color=Divider,modifier=Modifier.padding(horizontal=20.dp))};item{TextButton(onClick=onLogout,modifier=Modifier.padding(20.dp).fillMaxWidth()){Icon(Icons.Default.Logout,null);Spacer(Modifier.width(8.dp));Text("LOG OUT")}}}}
@Composable private fun EmptyState(title:String,body:String,icon:ImageVector,onClick:()->Unit){Column(Modifier.fillMaxWidth().padding(32.dp),horizontalAlignment=Alignment.CenterHorizontally){Icon(icon,null,tint=Muted,modifier=Modifier.size(44.dp));Text(title,fontWeight=FontWeight.Bold,fontSize=18.sp,modifier=Modifier.padding(top=14.dp));Text(body,color=Muted,fontSize=13.sp,modifier=Modifier.padding(top=6.dp));TextButton(onClick){Text("GET STARTED")}}}
