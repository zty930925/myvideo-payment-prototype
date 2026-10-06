function normalizeEntitlements(entitlement) {
  if (Array.isArray(entitlement)) return new Set(entitlement);
  const value = String(entitlement || 'unknown');
  if (value === 'luxury') return new Set(['luxury']);
  if (value === 'channel') return new Set(['channel']);
  if (value === 'four') return new Set(['four']);
  if (value === 'multi') return new Set(['luxury', 'channel', 'four']); // MVP broad multi-rights demo
  // Legacy compatibility
  if (value === 'monthly') return new Set(['luxury']);
  if (value === 'both') return new Set(['luxury', 'four']);
  return new Set([value]);
}

function evaluateTitle(title, entitlement = 'unknown') {
  if (!title) return null;
  const rights = normalizeEntitlements(entitlement);

  if (!title.available) {
    return {
      status: 'unavailable', label: '目前未提供', canWatch: false,
      reason: '此 mock 內容目前標記為未上架。正式產品應改查 MyVideo 即時片庫與授權資料。',
      recommendedAction: null,
    };
  }

  if (title.contentType === 'channel') {
    if (rights.has('channel') && title.channelIncluded) {
      return {
        status: 'channel_included', label: '頻道訂閱可觀看', canWatch: true,
        reason: '此 mock 頻道內容包含在頻道訂閱權益中。', recommendedAction: 'watch',
      };
    }
    return {
      status: 'channel_required', label: '需頻道訂閱', canWatch: false,
      reason: '此 mock 內容屬於頻道服務；豪華月租不等同於頻道訂閱。', recommendedAction: 'view_channel_subscription',
    };
  }

  if (rights.has('luxury') && title.subscriptionIncluded) {
    return {
      status: 'included', label: '豪華月租可直接觀看', canWatch: true,
      reason: '此 mock 隨選作品包含在豪華月租權益中，不需要再次付費。', recommendedAction: 'watch',
    };
  }

  if (rights.has('four') && title.fourPickEligible) {
    return {
      status: 'four_pick', label: '可使用 4 片自由選', canWatch: true,
      reason: '此 mock 作品符合 4 片自由選資格，可使用 1 部額度觀看。', recommendedAction: 'use_credit',
    };
  }

  if (title.rental?.available) {
    return {
      status: 'rental', label: '需單片租借', canWatch: false,
      reason: `目前權益未直接涵蓋此 mock 作品，但可使用單片租借。示意價格為 NT$${title.rental.price}，示意觀看期限 ${title.rental.durationHours} 小時。`,
      recommendedAction: 'rent',
    };
  }

  if (title.digitalPurchase) {
    return {
      status: 'purchase', label: '可數位購買', canWatch: false,
      reason: '目前權益未直接涵蓋此 mock 作品，可透過數位購買取得長期觀看權益。', recommendedAction: 'purchase',
    };
  }

  if (title.subscriptionIncluded && !rights.has('luxury')) {
    return {
      status: 'luxury_required', label: '需豪華月租', canWatch: false,
      reason: '此 mock 作品屬於豪華月租隨選內容；頻道訂閱不等同於豪華月租。', recommendedAction: 'view_luxury_subscription',
    };
  }

  return {
    status: 'not_covered', label: '目前權益未涵蓋', canWatch: false,
    reason: '此 mock 作品目前沒有符合所選權益的直接觀看方式。', recommendedAction: null,
  };
}

module.exports = { evaluateTitle, normalizeEntitlements };
