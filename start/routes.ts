import router from '@adonisjs/core/services/router';

const StatisticController = () => import('#controllers/StatisticController');

router.get('/statistic/online-users', [StatisticController, 'getOnlineUsers']);
