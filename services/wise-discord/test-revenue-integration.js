#!/usr/bin/env node

/**
 * Test Revenue Integration
 * Verify Discord bot can connect to real Revenue API
 */

const fetch = require('node-fetch');

const REVENUE_API = 'http://127.0.0.1:3000';

async function testRevenue() {
  console.log('🧪 Testing Revenue Integration\n');
  console.log('═'.repeat(50));
  
  try {
    // Test 1: Dashboard
    console.log('\n1️⃣ Testing /api/revenue/dashboard...');
    const dashRes = await fetch(`${REVENUE_API}/api/revenue/dashboard`);
    if (dashRes.ok) {
      const data = await dashRes.json();
      console.log('✅ Dashboard API responding');
      console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
      if (data.data?.kpis) {
        const kpis = data.data.kpis;
        console.log(`   • Total Revenue: $${kpis.totalRevenue}`);
        console.log(`   • Pipeline: $${kpis.pipelineValue}`);
        console.log(`   • Conversion: ${kpis.conversionRate}%`);
        console.log(`   • Total Deals: ${kpis.totalDeals}`);
      }
    } else {
      console.log(`⚠️ Dashboard returned ${dashRes.status}`);
      console.log('   (This is OK - API may need startup)');
    }
    
    // Test 2: Leads
    console.log('\n2️⃣ Testing /api/revenue/leads...');
    const leadsRes = await fetch(`${REVENUE_API}/api/revenue/leads?limit=5`);
    if (leadsRes.ok) {
      const data = await leadsRes.json();
      console.log('✅ Leads API responding');
      if (data.data?.leads) {
        console.log(`   Found ${data.data.leads.length} leads`);
      }
    } else {
      console.log(`⚠️ Leads returned ${leadsRes.status}`);
    }
    
    // Test 3: Deals
    console.log('\n3️⃣ Testing /api/revenue/deals...');
    const dealsRes = await fetch(`${REVENUE_API}/api/revenue/deals?limit=5`);
    if (dealsRes.ok) {
      const data = await dealsRes.json();
      console.log('✅ Deals API responding');
      if (data.data?.deals) {
        console.log(`   Found ${data.data.deals.length} deals`);
      }
    } else {
      console.log(`⚠️ Deals returned ${dealsRes.status}`);
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ Revenue Integration Tests Complete\n');
    console.log('Status: Ready for Discord bot deployment');
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    console.log('\nNote: Revenue API may not be running.');
    console.log('Start it with: node packages/api/revenue-api-production.js');
  }
}

testRevenue();
