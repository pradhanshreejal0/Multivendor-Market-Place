import { PageLayout } from './layout.model.js';
import { NotFoundError } from '../../utils/errors.js';

export const layoutService = {
  async getLayout(pageName = 'homepage', publishedOnly = false) {
    let layout = await PageLayout.findOne({ pageName });
    if (!layout) {
      // Create default layout
      layout = await PageLayout.create({
        pageName,
        blocks: [
          { id: 'b1', type: 'hero', props: { title: 'Welcome to ZenithBazaar', subtitle: 'Discover authentic Nepali & global products' } },
          { id: 'b2', type: 'product-grid', props: { title: 'Featured Products', limit: 8 } },
        ],
        publishedBlocks: [
          { id: 'b1', type: 'hero', props: { title: 'Welcome to ZenithBazaar', subtitle: 'Discover authentic Nepali & global products' } },
          { id: 'b2', type: 'product-grid', props: { title: 'Featured Products', limit: 8 } },
        ],
        status: 'published',
      });
    }

    return publishedOnly ? { blocks: layout.publishedBlocks } : layout;
  },

  async saveDraft(pageName = 'homepage', blocks) {
    let layout = await PageLayout.findOne({ pageName });
    if (!layout) {
      layout = new PageLayout({ pageName });
    }
    layout.blocks = blocks;
    layout.status = 'draft';
    await layout.save();
    return layout;
  },

  async publishLayout(pageName = 'homepage') {
    let layout = await PageLayout.findOne({ pageName });
    if (!layout) {
      throw new NotFoundError('Layout not found');
    }
    layout.publishedBlocks = layout.blocks;
    layout.status = 'published';
    await layout.save();
    return layout;
  },
};

export const layoutController = {
  async getLayout(req, res, next) {
    try {
      const { pageName = 'homepage' } = req.params;
      const publishedOnly = req.query.published === 'true';
      const layout = await layoutService.getLayout(pageName, publishedOnly);
      res.status(200).json({ success: true, data: { layout } });
    } catch (error) {
      next(error);
    }
  },

  async saveDraft(req, res, next) {
    try {
      const { pageName = 'homepage' } = req.params;
      const { blocks } = req.body;
      const layout = await layoutService.saveDraft(pageName, blocks);
      res.status(200).json({ success: true, message: 'Layout draft saved', data: { layout } });
    } catch (error) {
      next(error);
    }
  },

  async publishLayout(req, res, next) {
    try {
      const { pageName = 'homepage' } = req.params;
      const layout = await layoutService.publishLayout(pageName);
      res.status(200).json({ success: true, message: 'Layout published successfully', data: { layout } });
    } catch (error) {
      next(error);
    }
  },
};
