const {
  extractTitleFromMessage,
  findFaqAnswer,
  searchTitles,
} = require('./catalogService');
const { evaluateTitle } = require('./entitlementService');

const entitlementNames = {
  luxury: '豪華月租',
  channel: '頻道訂閱',
  four: '4 片自由選',
  multi: '多種觀看權益',
  none: '目前沒有付費方案',
  unknown: '不確定目前權益',
  monthly: '豪華月租', // legacy
  both: '豪華月租 + 4 片自由選', // legacy
};

function buildTitleReply(title, entitlement) {
  const evaluation = evaluateTitle(title, entitlement);
  const planName = entitlementNames[entitlement] || entitlementNames.unknown;

  let answer = `我幫您查到《${title.title}》。`;

  if (evaluation.status === 'unavailable') {
    answer += '在這份 MVP mock 資料中，此作品目前標記為「未提供」。';
  } else if (evaluation.status === 'channel_included') {
    answer += `依您目前選擇的「${planName}」權益，這個頻道 / 賽事內容可直接觀看。`;
  } else if (evaluation.status === 'channel_required') {
    answer += `這是頻道服務內容；您目前選擇的「${planName}」未包含頻道訂閱權益。`;
  } else if (evaluation.status === 'included') {
    answer += `依您目前選擇的「${planName}」權益，這部隨選作品可直接觀看，不需要再次付費。`;
  } else if (evaluation.status === 'four_pick') {
    answer += `依您目前選擇的「${planName}」權益，這部可使用 4 片自由選的 1 部額度觀看。`;
  } else if (evaluation.status === 'rental') {
    answer += `依您目前選擇的「${planName}」權益，這部目前不能直接觀看，但可使用單片租借。`;
  } else if (evaluation.status === 'purchase') {
    answer += `依您目前選擇的「${planName}」權益，這部目前不能直接觀看，但 mock 資料顯示可數位購買。`;
  } else if (evaluation.status === 'luxury_required') {
    answer += `這部 mock 作品屬於豪華月租隨選內容；您目前選擇的「${planName}」未包含豪華月租。`;
  } else {
    answer += `依您目前選擇的「${planName}」權益，尚未找到可直接觀看的方式。`;
  }

  answer += '提醒您：這是示範資料，不代表 MyVideo 現行真實片庫或授權狀態。';

  return { answer, evaluation };
}

function answerChat({ message = '', entitlement = 'unknown', hasImage = false }) {
  const trimmed = String(message || '').trim();
  const title = extractTitleFromMessage(trimmed);

  if (title) {
    const { answer, evaluation } = buildTitleReply(title, entitlement);
    return {
      type: 'title_result',
      title: evaluation.label,
      answer,
      matchedTitle: title,
      evaluation,
      entitlement,
      mock: true,
    };
  }

  if (hasImage) {
    return {
      type: 'image_received',
      title: '已收到您的圖片',
      answer: '圖片已成功送到後端。這一版 MVP 先完成真實上傳與聊天 API 流程，但尚未加入圖片辨識模型，因此目前不會從圖片自動抽出片名。下一階段可再接 Vision API，將辨識出的作品逐一送進同一套權益判斷服務。',
      entitlement,
      mock: true,
    };
  }

  const faq = findFaqAnswer(trimmed);
  if (faq) {
    return {
      type: 'faq',
      title: '方案與觀看規則說明',
      answer: `${faq.answer} 若您提供作品名稱，我可以再用 mock 片庫幫您做作品層級判斷。`,
      entitlement,
      mock: true,
    };
  }

  const searchResults = searchTitles(trimmed);
  if (searchResults.length) {
    const first = searchResults[0];
    const { answer, evaluation } = buildTitleReply(first, entitlement);
    return {
      type: 'title_result',
      title: evaluation.label,
      answer,
      matchedTitle: first,
      evaluation,
      entitlement,
      mock: true,
    };
  }

  if (!trimmed) {
    return {
      type: 'empty',
      title: '請告訴我想查的內容',
      answer: '您可以輸入作品名稱，例如「蜘蛛人：無家日可以看嗎？」；也可以詢問方案規則，或上傳片單圖片。',
      entitlement,
      mock: true,
    };
  }

  return {
    type: 'not_found',
    title: '目前在 mock 片庫中找不到這部作品',
    answer: '我目前使用的是少量示範資料，因此可能找不到您輸入的作品。您可以試試「蜘蛛人：無家日」、「今晚想看的電影」、「月租片庫示意劇集」、「自由選示意電影」或「體育頻道示意內容」。正式版本應改串 MyVideo 即時片庫搜尋 API。',
    entitlement,
    mock: true,
  };
}

module.exports = { answerChat };
