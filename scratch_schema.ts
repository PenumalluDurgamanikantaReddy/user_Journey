import { queryBigQueryRest } from './app/utils/bigqueryRest';

async function main() {
  const yv = await queryBigQueryRest('SELECT * FROM `dashboard-data-421414.globalrize_india.youversion_combined_language_statistics` LIMIT 1');
  const chat = await queryBigQueryRest('SELECT * FROM `dashboard-data-421414.globalrize_india.echo_chat_statistics_combined` LIMIT 1');
  
  if (yv.success && yv.data.length > 0) console.log('YouVersion Columns:', Object.keys(yv.data[0]));
  else console.log('YouVersion Error:', yv.error);
  
  if (chat.success && chat.data.length > 0) console.log('Echo Chat Columns:', Object.keys(chat.data[0]));
  else console.log('Echo Chat Error:', chat.error);
}

main().catch(console.error);
