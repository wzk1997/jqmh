const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');

Page({
    bindScenicLayout(e) { this.setData({uiChrome:e.detail}); },
    data: { tab: 'form', categories: ['游玩体验', '环境设施', '服务建议', '其他反馈'], categoryIndex: -1, content: '', phone: '', images: [], submitting: false, choosing: false, submitted: false, records: [], loading: false, loadError: false, page: 0, hasMore: false },
    onLoad(options = {}) { ProjectBiz.initPage(this); this._newRequest(); if (options.tab === 'records') { this.setData({tab:'records'}); this.loadRecords(); } },
    _newRequest() { this.requestId = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); },
    bindTab(e) {
        if (this.data.submitting || this.data.choosing) return;
        const tab = e.currentTarget.dataset.tab;
        this.setData({ tab });
        if (tab === 'records') this.loadRecords();
    },
    bindCategory(e) { if (!this.data.submitting) this.setData({ categoryIndex: Number(e.detail.value) }); },
    bindInput(e) { if (!this.data.submitting) this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); },
    chooseImages() {
        if (this.data.submitting || this.data.choosing || this.data.images.length >= 3) return;
        this.setData({ choosing: true });
        wx.chooseMedia({ count: 3 - this.data.images.length, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'],
            success: res => {
                const files = res.tempFiles || [];
                if (files.some(file => file.size > 5 * 1024 * 1024 || !/\.(png|jpe?g)$/i.test(file.tempFilePath))) return pageHelper.showNoneToast('请选择5MB以内的 JPG 或 PNG 图片');
                this.setData({ images: this.data.images.concat(files.map(file => ({ path: file.tempFilePath, fileID: '' }))).slice(0, 3) });
            }, complete: () => this.setData({ choosing: false })
        });
    },
    removeImage(e) { if (!this.data.submitting) this.setData({ images: this.data.images.filter((_, index) => index !== Number(e.currentTarget.dataset.index)) }); },
    previewImage(e) { wx.previewImage({ current: e.currentTarget.dataset.url, urls: this.data.images.map(image => image.path) }); },
    async previewRecord(e) {
        if (this._previewing) return;
        this._previewing = true;
        try {
            const id=e.currentTarget.dataset.id;
            const result=await cloudHelper.callCloudSumbit('feedback/my_list',{page:1,id},{title:'加载图片',hint:false});
            const row=((result.data||{}).list||[]).find(record=>record._id===id);
            const urls=row&&row.FEEDBACK_IMAGE_URLS||[];
            if(!urls.length)throw Error('图片暂不可查看');
            this.setData({records:this.data.records.map(record=>record._id===id?{...record,FEEDBACK_IMAGES:urls}:record)});
            wx.previewImage({current:urls[Number(e.currentTarget.dataset.index)||0]||urls[0],urls});
        } catch (_) { pageHelper.showNoneToast('图片暂不可查看，请刷新记录后重试'); }
        finally { this._previewing=false; }
    },
    async submit() {
        if (this.data.submitting || this.data.choosing) return;
        const content = this.data.content.trim(), phone = this.data.phone.trim();
        if (this.data.categoryIndex < 0) return pageHelper.showNoneToast('请选择反馈类型');
        if (content.length < 5 || content.length > 500) return pageHelper.showNoneToast('请填写5至500字的反馈内容');
        if (phone && !/^1[3-9]\d{9}$/.test(phone)) return pageHelper.showNoneToast('请填写正确的手机号码');
        this.setData({ submitting: true, error: '' });
        try {
            const images = this.data.images.map(image => ({ ...image }));
            for (let index = 0; index < images.length; index++) {
                if (images[index].fileID) continue;
                const base64=wx.getFileSystemManager().readFileSync(images[index].path,'base64');
                const uploadResult=await cloudHelper.callCloudSumbit('feedback/upload',{requestId:this.requestId,base64},{title:'正在上传'});
                const uploaded=uploadResult.data||{};
                if (!uploaded.fileID) throw new Error('图片上传失败，请重试');
                images[index].fileID = uploaded.fileID;
                this.setData({ images });
            }
            const res = await cloudHelper.callCloudSumbit('feedback/submit', { category: this.data.categories[this.data.categoryIndex], content, phone, images: images.map(image => image.fileID), requestId: this.requestId }, { title: '正在提交' });
            if (!res || !res.data || !res.data.id) throw new Error('提交未完成，请重试');
            this.setData({ submitted: true, submittedId: res.data.id, images: [], content: '', phone: '', categoryIndex: -1 });
            this._newRequest();
        } catch (err) { this.setData({ error: '反馈暂未提交成功，请重试。已填写的内容会保留。' }); }
        finally { this.setData({ submitting: false }); }
    },
    writeAnother() { this.setData({ submitted: false, error: '' }); },
    async loadRecords(e) {
        if (this.data.loading) return;
        const more = e && e.currentTarget && e.currentTarget.dataset.more;
        const page = more ? this.data.page + 1 : 1;
        this.setData({ loading: true, loadError: false });
        try {
            const res = await cloudHelper.callCloudSumbit('feedback/my_list', { page }, { title: '加载反馈' });
            const result = res.data;
            const records = result.list.map(item => ({ ...item, FEEDBACK_IMAGES: item.FEEDBACK_IMAGE_URLS || item.FEEDBACK_IMAGES || [], date: new Date(item.FEEDBACK_ADD_TIME).toLocaleDateString() }));
            this.setData({ records: more ? this.data.records.concat(records) : records, page, hasMore: page * 10 < result.total });
        } catch (err) { this.setData({ loadError: true }); }
        finally { this.setData({ loading: false }); }
    }
});
