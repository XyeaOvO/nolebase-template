# 在 dash.js 5.0.1 中添加自定义 ABR 规则

本文将指导如何在 dash.js 项目中添加一个全新的、自定义的 ABR 规则。为了清晰地展示集成过程，我们将添加一个名为 `Bba0Rule` 的“伪规则”（Fake Rule）。即这个规则的逻辑（按顺序循环切换可用的视频码率）并没有实现真正的BBA0算法。

**修改概览：**

*   **新增核心规则文件:** `src/streaming/rules/abr/Bba0Rule.js`
*   **注册规则:** 修改 `ABRRulesCollection.js` 以识别和创建新规则实例。
*   **添加配置:** 修改 `Settings.js` 以允许启用/禁用新规则，并提供默认配置。
*   **前端 UI 集成:** 在参考播放器 (`samples/dash-if-reference-player/`) 中添加复选框以控制规则的激活状态。

### 第一步：创建新的规则文件 (`Bba0Rule.js`)

这是实现自定义 ABR 逻辑的核心。一个基本的 ABR 规则文件需要遵循 dash.js 的模式：

1.  **使用 FactoryMaker:** dash.js 使用工厂模式来创建和管理对象实例。
2.  **实现 `getSwitchRequest` 方法:** 这是规则的核心。ABR 控制器会定期调用此方法。你需要在此方法中分析当前状况（通过 `rulesContext` 获取信息），并决定是否需要切换到不同的码率（Representation）。如果需要切换，返回一个包含目标 `Representation` 的 `SwitchRequest` 对象；否则返回一个表示“无需切换”的 `SwitchRequest` 对象。
3.  **实现 `reset` 方法:** 当媒体会话结束或需要重置状态时，此方法会被调用。你可以在这里清理规则的内部状态。
4.  **（可选）`setup` 方法:** 用于初始化，例如设置日志记录器。

以下是 `Bba0Rule.js` 的示例（仅作演示，并非实际BBA0算法）：

```javascript
// src/streaming/rules/abr/Bba0Rule.js
import FactoryMaker from '../../../core/FactoryMaker.js';
import SwitchRequest from '../SwitchRequest.js';
import Debug from '../../../core/Debug.js'; // 用于日志记录

function Bba0Rule() {
    const context = this.context;
    let logger;
    let instance;
    let lastSelectedIndex = -1; // 用于记录上次选择的码率索引，-1表示初始

    function setup() {
        // 获取日志记录器实例
        logger = Debug(context).getInstance().getLogger(instance);
        logger.info('【BBA0规则 - 伪顺序测试】初始化完成');
    }

    function getSwitchRequest(rulesContext) {
        const switchRequest = SwitchRequest(context).create();
        switchRequest.rule = this.getClassName(); // 标记这个决策是由哪个规则做出的

        logger.info('【BBA0规则】getSwitchRequest 函数被调用!');

        try {
            const mediaType = rulesContext.getMediaType();
            // 这个伪规则只针对 video 类型进行测试
            if (mediaType !== 'video') {
                return switchRequest; // 其他类型直接返回，不干扰
            }

            const abrController = rulesContext.getAbrController();
            const currentRepresentation = rulesContext.getRepresentation(); // 获取当前播放的码率信息

            // 获取所有可用的码率（Representations）
            const representations = abrController.getPossibleVoRepresentationsFilteredBySettings(rulesContext.getMediaInfo(), true);

            if (!representations || representations.length <= 1) {
                logger.warn('【BBA0规则】可用码率不足 (<=1)，无需切换。');
                lastSelectedIndex = representations.length === 1 ? 0 : -1; // 更新状态
                return switchRequest;
            }

            // --- 核心伪逻辑：顺序循环切换 ---
            let currentUsedIndex = lastSelectedIndex;
            // 如果是第一次或无法确定当前，则从最后一个开始
            if (currentUsedIndex === -1) {
                if (currentRepresentation) {
                     // 尝试找到当前码率在列表中的索引
                    currentUsedIndex = representations.findIndex(rep => rep && rep.id === currentRepresentation.id);
                    if (currentUsedIndex === -1) currentUsedIndex = representations.length - 1; // 没找到也从最后一个开始
                } else {
                    currentUsedIndex = representations.length - 1; // 无法获取当前，从最后一个开始
                }
            }

            // 计算下一个索引（循环）
            const nextIndex = (currentUsedIndex + 1) % representations.length;
            const nextRepresentation = representations[nextIndex];

            logger.debug(`【BBA0规则】当前索引: ${currentUsedIndex}, 下个目标索引: ${nextIndex}`);

            // 如果计算出的下一个码率与当前不同，则发出切换请求
            if (nextRepresentation && (!currentRepresentation || nextRepresentation.id !== currentRepresentation.id)) {
                switchRequest.representation = nextRepresentation; // 设置目标码率
                switchRequest.reason = { // 附带切换原因（调试用）
                    message: `【BBA0规则 - 伪顺序测试】执行循环切换: 从索引 ${currentUsedIndex} 切换到索引 ${nextIndex} (${nextRepresentation.bandwidth / 1000} kbps).`
                };
                logger.info(switchRequest.reason.message);
                lastSelectedIndex = nextIndex; // *** 更新状态，记住这次选择的索引 ***
            } else {
                logger.info(`【BBA0规则】计算出的下一个 (${nextIndex}) 与当前 (${currentUsedIndex}) 相同或无效，不发出切换请求。`);
                lastSelectedIndex = currentUsedIndex; // 保持状态
            }
            // --- 伪逻辑结束 ---

        } catch (e) {
            logger.error('【BBA0规则 - 伪顺序测试】在 getSwitchRequest 中发生错误:', e);
            lastSelectedIndex = -1; // 重置状态
            // 清除可能错误的切换请求
            switchRequest.representation = null;
            switchRequest.reason = null;
        }

        return switchRequest;
    }

    function reset() {
        logger.info('【BBA0规则 - 伪顺序测试】规则被重置 (reset 调用)');
        lastSelectedIndex = -1; // 重置状态变量
    }

    instance = {
        getSwitchRequest,
        reset,
        getClassName: () => Bba0Rule.__dashjs_factory_name // 返回规则类名
    };

    setup(); // 执行初始化
    return instance;
}

// 定义工厂名称，dash.js内部使用
Bba0Rule.__dashjs_factory_name = 'Bba0Rule';
// 导出工厂类
export default FactoryMaker.getClassFactory(Bba0Rule);
```

### 第二步：注册规则 (`ABRRulesCollection.js`)

创建了规则文件后，你需要告诉 dash.js 的 ABR 系统“有这么一个新规则存在，并且在需要时创建它”。这主要在 `src/streaming/rules/abr/ABRRulesCollection.js` 文件中完成：

1.  **导入新规则:**
    ```javascript
    import Bba0Rule from './Bba0Rule.js';
    ```

2.  **在初始化时将其添加到规则列表:** 
    ```javascript
    function _updateRules() {
        // ... 其他规则的处理 ...
        qualitySwitchRules = _handleRuleUpdate('Bba0Rule', qualitySwitchRules); // <--- 添加这一行或类似逻辑
        // ...
        console.log('[ABRRulesCollection] 更新质量切换规则:', qualitySwitchRules.map(r => r.getClassName())); // 日志确认
    }
    ```
    `_handleRuleUpdate` 函数会根据配置决定是否创建和添加这个规则实例。

3.  **在规则创建函数 (`_createRule`) 中添加 case:** 这个内部函数负责实际创建规则实例。你需要为你的新规则添加一个 `case` 分支：
    ```javascript
    function _createRuleInstance(ruleName) {
        switch (ruleName) {
            // ... 其他规则的 case ...
            case 'BolaRule':
                // ... BolaRule的创建逻辑 ...
                break;
            case 'Bba0Rule': // <--- 添加 Bba0Rule 的 case
                console.log('[ABRRulesCollection] 创建 Bba0Rule instance...');
                return Bba0Rule(context).create({ // 调用 Bba0Rule 的工厂方法
                    // 传入 Bba0Rule 可能需要的依赖项
                    dashMetrics: dashMetrics,
                    settings: settings
                    // 如果 Bba0Rule 需要其他依赖，如 mediaPlayerModel，也在这里传入
                });
            // ... 其他规则的 case ...
        }
    }
    ```
    确保传递了规则实现中需要的依赖项（如 `dashMetrics`, `settings`）。

### 第三步：添加配置 (`Settings.js`)

1.  **（可选）添加 JSDoc 文档注释:**
    良好的文档是代码可维护性的关键。我们需要添加 JSDoc 注释来描述新的配置项。这包括：
    *   **`@property`**: 在描述 `streaming.abr.rules` 对象（或其父对象）的 JSDoc 块中，添加一个 `@property` 标签来指明 `bba0Rule` 是其中的一个配置选项。
    *   **`@typedef`**: 添加一个新的 `@typedef` 块来详细定义 `Bba0Rule` 配置对象的结构，包括其属性（如 `active`, `parameters`）和描述。

    ```javascript
    // src/core/Settings.js

    // 首先，在描述 settings.streaming.abr.rules 的 JSDoc 块中添加 @property
    /**
     * ... (其他属性描述) ...
     * @property {module:Settings~BolaRule} [bolaRule]
     * Configuration of the BOLA rule
     * @property {module:Settings~Bba0Rule} [bba0Rule]                 // <--- 添加 @property
     * Configuration of the BBA-0 rule (BBA-0 规则的配置)            // <--- 添加描述
     * ... (其他规则描述) ...
     */

    // 接着，在合适的位置（如下方示例），添加 Bba0Rule 的 @typedef
    /**
     * @typedef {Object} ThroughputRule
     * ...
     */

    // --- 开始: 添加 Bba0Rule 的 Typedef 定义 ---
    /**
     * @typedef {Object} Bba0Rule
     * @property {boolean} [active=false] // 默认设为 false，即不激活
     * Enable or disable the rule (启用或禁用此规则)
     * @property {object} [parameters={}] // BBA-0 特定参数的占位符
     * Configures the rule specific parameters. (配置规则特定参数)
     * 例如:
     * - `reservoir`: 目标最小缓冲时长 (秒).
     * - `cushion`: 目标缓冲上限时长 (秒).
     */
    // --- 结束: 添加 Bba0Rule 的 Typedef 定义 ---

    /**
     * @typedef {Object} InsufficientBufferRule
     * ...
     */
    ```

2.  **关联active变更事件:**
    当规则的激活状态 (`active`) 改变时，通常需要通知 ABR 控制器重新评估当前生效的规则。我们将 `bba0Rule.active` 的路径添加到 `settingsEvents` 映射中，使其在变更时触发 `SETTING_UPDATED_ABR_ACTIVE_RULES` 事件。

    ```javascript
    // src/core/Settings.js
    // 在 settingsEvents 对象中添加新规则的 active 状态路径
    const DISPATCH_KEY_MAP = {
        // ... 其他配置路径 ...
        'streaming.abr.rules.bolaRule.active': Events.SETTING_UPDATED_ABR_ACTIVE_RULES,
        'streaming.abr.rules.bba0Rule.active': Events.SETTING_UPDATED_ABR_ACTIVE_RULES, // <--- 添加此行
        // ... 其他配置路径 ...
    };
    ```

3.  最后，在 `Settings` 函数返回的默认配置对象中，找到 `streaming.abr.rules` 部分，添加 `bba0Rule` 对象，并设置其默认值。此外还需要修改两处默认设置以使得我们的自定义ABR生效。

    ```javascript
    // src/core/Settings.js
    function Settings() {
        // ...
        const defaults = {
            // ...
            streaming: {
                // ...
                abr: {
                    // ...
                    useDefaultABRRules: true,
                    ABRStrategy: Constants.ABR_STRATEGY_DYNAMIC,
                    movingAverageMethod: Constants.MOVING_AVERAGE_METHOD_EWMA,
                    rules: {
                        bolaRule: { // Existing rule
                            active: true
                        },
                        bba0Rule: {         // <--- 添加新规则的默认配置
                            active: false,  // 默认不激活
                            parameters: {}  // 默认空的参数对象
                        },
                        // ... 其他规则 ...
                    },
                },
                // ...
                 buffer: {
                     enableSeekDecorrelationFix: false,
                     fastSwitchEnabled: false, // 注意这里改成false
                     flushBufferAtTrackSwitch: false,
                     reuseExistingSourceBuffers: true,
                     bufferPruningInterval: 10,
                     // ...
                 },
                 trackSwitchMode: {
                     audio: Constants.TRACK_SWITCH_MODE_ALWAYS_REPLACE,
                     video: Constants.TRACK_SWITCH_MODE_ALWAYS_REPLACE // 改成永远替代
                 },
                // ...
            },
            // ...
        };
        // ...
    }

    ```
### 第四步：前端UI 集成

为了方便测试和演示，需要在 dash.js 的参考播放器 (`samples/dash-if-reference-player/`) 中添加一个 UI 控件来启用/禁用你的规则。

1.  **修改 HTML (`index.html`):** 在 ABR 规则设置区域添加一个复选框：
    ```html
    <!-- samples/dash-if-reference-player/index.html -->
    <!-- ... 其他规则复选框 ... -->
    <label class="topcoat-checkbox" data-toggle="tooltip" data-placement="right"
           title="Enable/Disable BolaRule">
        <input type="checkbox" ng-change="toggleBufferRule()" id="bolaRule"
               ng-model="activeAbrRules.bolaRule">
        BolaRule
    </label>
    <!-- --- 在这里添加 BBA0 规则的复选框 --- -->
    <label class="topcoat-checkbox" data-toggle="tooltip" data-placement="right"
           title="Enable/Disable Bba0Rule">
        <input type="checkbox" ng-change="toggleBufferRule()" id="bba0Rule"
               ng-model="activeAbrRules.bba0Rule"> <!-- 绑定到 scope 中的 bba0Rule 状态 -->
        Bba0Rule
    </label>
    <!-- --- 结束添加 --- -->
    ```

2.  **修改JS (`app/main.js`):**
    *   **读取初始状态:** 在控制器初始化或加载新视频源后，从播放器设置中读取 `bba0Rule` 的当前激活状态，并更新到 `$scope`：
        ```javascript
        var currentConfig = $scope.player.getSettings();
        // ... 读取其他规则状态 ...
        $scope.activeAbrRules.bba0Rule = currentConfig.streaming.abr.rules.bba0Rule.active; // <--- 读取 bba0Rule 状态
        // ...
        ```
    *   **更新播放器设置:** 在 `toggleBufferRule` 函数中，将 `$scope` 中所有规则的当前状态写回到播放器的设置中：
        ```javascript
        $scope.toggleBufferRule = function () {
            $scope.player.updateSettings({
                'streaming': {
                    'abr': {
                        'rules': {
                            // ... 更新其他规则状态 ...
                            bolaRule: {
                                active: $scope.activeAbrRules.bolaRule
                            },
                            bba0Rule: { // <--- 添加 bba0Rule 的更新
                                active: $scope.activeAbrRules.bba0Rule
                            },
                            // ...
                        }
                    }
                }
            });
        };
        ```

### 第五步：测试结果

只在`Options`里面只勾选`Bba0Rule`，可以看到视频的码率档位从最低1档逐渐加到10档再回落，符合预期结果。

![](Pic/截图%202025-04-14%2019-07-22.png)

![](Pic/截图%202025-04-14%2019-04-12.png)
