// NewsWaterfall owns card presentation only; pages own fetching and pagination.
const { normalizeContent } = require('../../../projects/TRIP1/ui/content_ui.js');
const pageHelper = require('../../../helper/page_helper.js');
Component({
    options: { addGlobalClass: true },
    properties: {
        enlarged:{type:Boolean,value:false,observer(){this.layoutItems();}},
        compact: {type: Boolean, value: false, observer() { this.layoutItems(); }},
        mediaUrls: {type: Object, value: {}},
        items: { type: Array, value: [], observer() { this.layoutItems(); } },
    },
    data: { columns: [[], []] },
    lifetimes: { attached() { this.imageHeights = {}; this.layoutItems(); } },
    methods: {
        layoutItems() {
            const count=this.data.enlarged?1:2;
            const heights=Array(count).fill(0),columns=Array.from({length:count},()=>[]);
            this.imageHeights = this.imageHeights || {};
            const rows = (this.data.items || []).map(item => normalizeContent(item)).filter(item => item.id);
            rows.forEach((item, index) => {
                const imageHeight = this.data.enlarged ? (this.data.compact?360:400) : this.data.compact ? 180 : this.imageHeights[item.key] || (item.pic ? [248, 320, 280, 224][index % 4] : [220, 290, 250, 200][index % 4]);
                const column = count===1?0:heights[0] <= heights[1] ? 0 : 1;
                const estimatedText = 74 + Math.min(2, Math.ceil(item.title.length / 11)) * 38 + (item.desc ? 76 : 0) + (item.date ? 40 : 0);
                columns[column].push({ ...item, imageHeight });
                heights[column] += imageHeight + estimatedText + 20;
            });
            this.setData({ columns });
        },
        imageLoaded(e) {
            if (this.data.compact||this.data.enlarged) return;
            const key = e.currentTarget.dataset.key;
            if (!e.detail.width || !e.detail.height) return;
            const height = Math.max(180, Math.min(420, Math.round(334 * e.detail.height / e.detail.width)));
            if (this.imageHeights[key] === height) return;
            this.imageHeights[key] = height;
            this.layoutItems();
        },
        url(e) { pageHelper.url(e, this); },
    }
});
