package com.wise2.trading

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Bg = Color(0xFF050806)
private val Panel = Color(0xFF0C120E)
private val Panel2 = Color(0xFF111A13)
private val Neon = Color(0xFF77FF4D)
private val Silver = Color(0xFFE3E7E4)
private val Muted = Color(0xFF91A095)
private val Warn = Color(0xFFFFC857)
private val Danger = Color(0xFFFF5D67)

private enum class Tab(val title: String) {
    Home("Home"), Scanner("Scanner"), Portfolio("Portfolio"), Strategies("Strategies"), Imp("IMP")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Wise2TradingApp()
            }
        }
    }
}

@Composable
private fun Wise2TradingApp() {
    var tab by remember { mutableStateOf(Tab.Home) }
    var selectedSetup by remember { mutableStateOf<MarketSetup?>(null) }

    val setups = remember {
        listOf(
            MarketSetup("NVDA", "STOCK", "Momentum Pullback", 87, 127.40, 124.85, 134.10, 3.0, "Trend aligned, relative volume elevated, momentum strengthening."),
            MarketSetup("SPY", "ETF", "Trend Continuation", 82, 572.10, 568.40, 580.80, 1.0, "Broad-market trend remains constructive with healthy breadth."),
            MarketSetup("BTC/USD", "CRYPTO", "Crypto Trend", 79, 112340.0, 109900.0, 118500.0, 0.01, "Higher highs and expanding momentum with controlled position sizing."),
            MarketSetup("AMD", "STOCK", "Breakout", 76, 168.20, 164.70, 176.50, 2.0, "Price pressing resistance with improving volume and relative strength.")
        )
    }

    val account = remember { PaperAccount(10_746.25, 19_420.0, 126.40, 2_310.0) }

    Scaffold(
        containerColor = Bg,
        bottomBar = {
            NavigationBar(containerColor = Panel) {
                Tab.entries.forEach { item ->
                    NavigationBarItem(
                        selected = tab == item,
                        onClick = { tab = item },
                        icon = { Text(if (item == Tab.Imp) "🐂" else "•", color = if (tab == item) Neon else Muted) },
                        label = { Text(item.title, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedTextColor = Neon,
                            unselectedTextColor = Muted,
                            indicatorColor = Panel2
                        )
                    )
                }
            }
        },
        floatingActionButton = {
            Box(
                modifier = Modifier
                    .size(62.dp)
                    .background(Neon, CircleShape)
                    .clickable { tab = Tab.Imp },
                contentAlignment = Alignment.Center
            ) {
                Text("🐂", fontSize = 28.sp)
            }
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding).background(Bg)) {
            when (tab) {
                Tab.Home -> Dashboard(account, setups, onSetup = { selectedSetup = it })
                Tab.Scanner -> ScannerScreen(setups, onSetup = { selectedSetup = it })
                Tab.Portfolio -> PortfolioScreen(account)
                Tab.Strategies -> StrategiesScreen()
                Tab.Imp -> ImpScreen(setups.first())
            }

            selectedSetup?.let { setup ->
                TradeReviewSheet(
                    setup = setup,
                    account = account,
                    onDismiss = { selectedSetup = null }
                )
            }
        }
    }
}

@Composable
private fun Dashboard(account: PaperAccount, setups: List<MarketSetup>, onSetup: (MarketSetup) -> Unit) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Spacer(Modifier.height(10.dp)) }
        item { Header() }
        item { RegimeCard() }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard("Paper Equity", money(account.equity), "+1.2% today", Modifier.weight(1f))
                MetricCard("WISE Guard", "PASS", "Risk mode: Normal", Modifier.weight(1f))
            }
        }
        item { SectionTitle("TOP AI SETUPS") }
        items(setups.take(3)) { setup -> SetupRow(setup, onSetup) }
        item { SectionTitle("IMP INSIGHT") }
        item {
            PanelCard {
                Text("🐂  Momentum is leading today", color = Neon, fontWeight = FontWeight.Bold)
                Text("Three setups meet current WISE Guard limits. Review NVDA first; it has the highest WISE Score.", color = Silver, modifier = Modifier.padding(top = 8.dp))
            }
        }
        item { Spacer(Modifier.height(80.dp)) }
    }
}

@Composable
private fun Header() {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("W² TRADING", color = Silver, fontSize = 24.sp, fontWeight = FontWeight.Black)
            Text("COMMAND CENTER · PAPER MODE", color = Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Text("LIVE", color = Neon, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun RegimeCard() {
    PanelCard {
        Text("MARKET REGIME", color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("BULLISH TREND", color = Neon, fontSize = 22.sp, fontWeight = FontWeight.Black)
                Text("Momentum strong · Volatility moderate", color = Silver, fontSize = 12.sp)
            }
            Text("84%", color = Neon, fontSize = 28.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
private fun MetricCard(title: String, value: String, subtitle: String, modifier: Modifier = Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.padding(14.dp)) {
            Text(title.uppercase(), color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Text(value, color = Neon, fontSize = 20.sp, fontWeight = FontWeight.Black)
            Text(subtitle, color = Silver, fontSize = 10.sp)
        }
    }
}

@Composable
private fun ScannerScreen(setups: List<MarketSetup>, onSetup: (MarketSetup) -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Header() }
        item { SectionTitle("AI MARKET SCANNER") }
        item { Text("Ranked across stocks, ETFs, and crypto. Every trade still requires your approval.", color = Muted) }
        items(setups) { SetupRow(it, onSetup) }
    }
}

@Composable
private fun SetupRow(setup: MarketSetup, onSetup: (MarketSetup) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onSetup(setup) },
        colors = CardDefaults.cardColors(containerColor = Panel),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(setup.symbol, color = Silver, fontWeight = FontWeight.Black, fontSize = 18.sp)
                Text("${setup.assetClass} · ${setup.strategy}", color = Muted, fontSize = 11.sp)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("${setup.wiseScore}", color = Neon, fontSize = 22.sp, fontWeight = FontWeight.Black)
                Text("WISE SCORE", color = Muted, fontSize = 9.sp)
            }
        }
    }
}

@Composable
private fun PortfolioScreen(account: PaperAccount) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header() }
        item { SectionTitle("PAPER PORTFOLIO") }
        item { MetricCard("Equity", money(account.equity), "Alpaca paper account") }
        item { MetricCard("Buying Power", money(account.buyingPower), "Available simulated capital") }
        item { MetricCard("Daily P/L", "+${money(account.dailyPnl)}", "Open + closed paper positions") }
        item { MetricCard("Open Exposure", money(account.openExposure), "21.5% of equity") }
        item {
            PanelCard {
                Text("LIVE BACKEND STATUS", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("WISE² API contract ready", color = Neon, fontWeight = FontWeight.Bold)
                Text("Paper credentials remain server-side; the APK never stores Alpaca secret keys.", color = Silver, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun StrategiesScreen() {
    val strategies = listOf(
        Triple("Momentum Pullback", "61% win rate", "+7.4%"),
        Triple("Trend Continuation", "58% win rate", "+5.9%"),
        Triple("Breakout", "54% win rate", "+4.1%"),
        Triple("Crypto Trend", "57% win rate", "+6.2%"),
        Triple("Mean Reversion", "49% win rate", "+1.3%")
    )
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Header() }
        item { SectionTitle("STRATEGY ARENA") }
        items(strategies) { s ->
            PanelCard {
                Row(Modifier.fillMaxWidth()) {
                    Column(Modifier.weight(1f)) {
                        Text(s.first, color = Silver, fontWeight = FontWeight.Bold)
                        Text(s.second, color = Muted, fontSize = 11.sp)
                    }
                    Text(s.third, color = Neon, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
private fun ImpScreen(top: MarketSetup) {
    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Header() }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(82.dp).background(Neon, CircleShape), contentAlignment = Alignment.Center) {
                    Text("🐂", fontSize = 42.sp)
                }
                Column(Modifier.padding(start = 14.dp)) {
                    Text("TRADING IMP", color = Neon, fontSize = 26.sp, fontWeight = FontWeight.Black)
                    Text("Active paper-trading copilot", color = Muted)
                }
            }
        }
        item {
            PanelCard {
                Text("CURRENT READ", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text("${top.symbol} is the strongest qualified setup at ${top.wiseScore}/100.", color = Silver, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text(top.thesis, color = Muted, modifier = Modifier.padding(top = 8.dp))
            }
        }
        item { QuickPrompt("Find my safest setup") }
        item { QuickPrompt("Explain today’s market regime") }
        item { QuickPrompt("Compare Momentum vs Breakout") }
        item { QuickPrompt("Review my paper portfolio") }
    }
}

@Composable
private fun QuickPrompt(text: String) {
    Card(colors = CardDefaults.cardColors(containerColor = Panel2), shape = RoundedCornerShape(12.dp)) {
        Text("🐂  $text", color = Silver, modifier = Modifier.fillMaxWidth().padding(15.dp), fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun TradeReviewSheet(setup: MarketSetup, account: PaperAccount, onDismiss: () -> Unit) {
    val decision = RiskGuard.evaluate(account.equity, setup.estimatedRisk, if (account.dailyPnl < 0) -account.dailyPnl else 0.0, account.openExposure)
    Box(Modifier.fillMaxSize().background(Color(0xDD000000)), contentAlignment = Alignment.BottomCenter) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Panel2),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("REVIEW PAPER TRADE", color = Neon, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("${setup.symbol} · ${setup.strategy}", color = Silver, fontSize = 24.sp, fontWeight = FontWeight.Black)
                Text("WISE Score ${setup.wiseScore}/100", color = Neon, fontWeight = FontWeight.Bold)
                TradeLine("Entry", price(setup.entry))
                TradeLine("Stop", price(setup.stop))
                TradeLine("Target", price(setup.target))
                TradeLine("Quantity", setup.quantity.toString())
                TradeLine("Estimated Risk", money(setup.estimatedRisk))
                TradeLine("Reward / Risk", "%.2f : 1".format(setup.rewardRisk))
                Text("IMP THESIS", color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Text(setup.thesis, color = Silver, fontSize = 12.sp)
                Text(if (decision.allowed) "WISE GUARD · PASS" else "WISE GUARD · BLOCKED", color = if (decision.allowed) Neon else Danger, fontWeight = FontWeight.Black)
                if (!decision.allowed) Text(decision.reasons.joinToString(" · "), color = Danger, fontSize = 11.sp)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray), modifier = Modifier.weight(1f)) {
                        Text("REJECT")
                    }
                    Button(
                        onClick = onDismiss,
                        enabled = decision.allowed,
                        colors = ButtonDefaults.buttonColors(containerColor = Neon, contentColor = Color.Black),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("APPROVE PAPER TRADE", fontSize = 11.sp, fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    }
}

@Composable
private fun TradeLine(label: String, value: String) {
    Row(Modifier.fillMaxWidth()) {
        Text(label, color = Muted, modifier = Modifier.weight(1f))
        Text(value, color = Silver, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(text, color = Silver, fontSize = 13.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 6.dp))
}

@Composable
private fun PanelCard(content: @Composable ColumnScope.() -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), content = content)
    }
}

private fun money(value: Double) = "$%,.2f".format(value)
private fun price(value: Double) = if (value >= 1000) "$%,.2f".format(value) else "$%.2f".format(value)
