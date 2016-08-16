//=============================================================================
// Rubi_riru.js
//=============================================================================
/*:
 * @plugindesc ルビ振りを行います。用語登録によるオートルビ振り機能つき。
 * @author riru, merusaia（辞書のみ。著作表示は「riru」だけでOKです）
 *
 *
 * @param Auto Ruby
 * @desc 自動ルビ振りをする（する：true　しない：false）
 * @default true
 *
 * @param Help Auto Ruby
 * @desc スキルの説明やヘルプメッセージ等（ヘルプで一部制御文字が使えるところ）も自動ルビ振りをする（する：true　しない：false）
 * @default true
 *
 * @param Database Auto Ruby
 * @desc アクターやアイテム名などウィンドウ内の他すべての場所も自動ルビ振りをする（する：true　しない：false）
 * @default true
 *
 * @param Jisage
 * @desc 字下げを行う（1行目は字下げをしないとルビが切れます。）（する：0　しない：1　ルビがあるときだけ字下げ：2）
 * @default 0
 *
 * @param Ruby Size
 * @desc ルビのサイズ補正。字下げONの場合このサイズに合わせて字下げ、行詰みの度合いが変わります。あまり大きすぎると上の文字に被ります
 * @default -1
 *
 * @help
 *
 * ルビ振りプラグイン ver 1.04
 *
 *＜使い方＞
 *\r[ルビを振る漢字,よみがな]と記入すると漢字の上によみがながつきます。
 *例）\r[君,きみ]
 *jsエディタでこのファイルを開いてGame_Message.prototype.rubyDictionary　の中によく使う単語を登録しておくと自動でルビ振りをしてくれます。ただし手動でもルビ振りをしている場合は手動の読みを優先します。ひらがな、カタカナは送り仮名として認識され漢字、アルファベットの上にのみルビがつきます。
 *※認識の関係上、[,の中は自動ルビ振りがされません。（例[この中はだめ,）この場合はお手数ですが手動で設定していただきますようお願いいたします
 *
 * ＜規約＞
 * 有償無償問わず使用できます。改変もご自由にどうぞ。使用報告もいりません。２次配布はだめです
 *著作権は放棄していません。使用する場合は以下の作者とURLをreadmeなどどこかに記載してください
 *
 * ＜作者情報＞
 *作者：riru 
 *HP：ガラス細工の夢幻
 *URL：http://garasuzaikunomugen.web.fc2.com/index.html
 *＜更新履歴＞
 *4月18日　Ver1.04。1.03の修正内で記号等が反映されていなかった不具合を修正。
 *4月18日　Ver1.03。文章以外で全角と半角文字が混合していると文字幅が狭くなる不具合を修正。
 *2016年4月14日　Ver1.02。ヘルプメッセージやアクター名などにもルビ振り可能になりました
 *2016年4月12日　Ver1.01。制御文字の直後,同じ単語が連続しているなど特定の条件下で自動ルビ振りがうまくいかない不具合を修正。
 */

(function() {

    var parameters = PluginManager.parameters('Rubi_riru');
    var p_auto_Ruby = Boolean(parameters['Auto Ruby']       === 'true' || false);
    var p_help_auto_Ruby = Boolean(parameters['Help Auto Ruby']       === 'true' || false);
    var p_data_auto_Ruby = Boolean(parameters['Database Auto Ruby']       === 'true' || false);
    var p_Jisage = Number(parameters['Jisage'] || 0);
    var ruby_c_size = Number(parameters['Ruby Size'] || -1);

Game_Message.prototype.rubyDictionary = function() {
//自動登録用辞書。ここに直接書き込む（送り仮名込み）。漢字が被る場合は文字数が多い文字を先に。
//例
//var ruby_dic = [["君達","きみたち"],["楽し","たの"],["楽","らく"],["君","くん"]];
var ruby_dic = 
[

// ここは、メルサイアが追加　(ルビ間違い、バグ報告・お問い合わせは、twitter @merusaia まで。)
// 以下、メモ
// ・["検索でヒットさせる文字", "最初の送り仮名までのよみがな"]の形式で書いてね。
// 　→　["響き合える","ひび"]とすると、「響」のうえに、「ひび」というよみがなが振られるよ。

// ・はじめの漢字にしかルビはふれないから、気をつけてね。
// 　→　["響き合える","ひびきあ"]としても、変になるだけだよ。["響き","ひび"],["合える","あ"]と、分けて定義しましょう。

// ・"同じ漢字でも、送り仮名を工夫すると、違うルビをふれるよ。
// 　→　["響き合える","ひび"]と、["響ちゃん","ひびき"]を両方宣言すると、どっちも使えるよ。
//       でも、想定外の文字列検索ヒットに気をつけてね。（例：「影響ちゃんとある？」とかでも、「影響（ひびき）ちゃんとある？」になっちゃうよ）

// ・同じ検索文字が入っている場合は、"検索でヒットさせる文字"が大きい順に書いてね。
// 　→　["四文字熟語","よんもじじゅくご"],["文字","もじ"] の順で宣言すると、正常にルビが振られるよ。
//       ["文字","もじ"],["四文字熟語","よんもじじゅくご"] の順で宣言すると、四文字熟語の方の効果はなくなっちゃうから、気をつけてね。

// ・あんまり多く宣言し過ぎると、処理速度に影響があるよ。
// 　→　なるべく控えめにね。特に、"検索でヒットさせる文字"が２文字や、１文字の場合は、一文字ずつ調べちゃうから、時間かかるよ。

//■"検索でヒットさせる文字"が４文字以上。
// シナリオ用。必要に応じて、自分用に変えてください。
["隗より始めよ","かい"],["自己欺瞞","じこぎまん"],["神出鬼没","しんしゅつきぼつ"],["巨万といる","ごまん"],

// ■"検索でヒットさせる文字"が３文字
["放った","はな"],["倒した","たお"],//はなった、たおした、は入れておかないと、子どもが読めないかも？

  // レヴアースシナリオ用。
  ["精霊","せいれい"],["除霊","じょれい"],["詠唱","えいしょう"],
  ["屈辱","くつじょく"],["並大抵","なみたいてい"],["知恵","ちえ"],["精進","しょうじん"],["挫け","くじ"],["根性","こんじょう"],
  ["流石","さすが"],["挽回","ばんかい"],["随分","ずいぶん"],["他愛も","たあい"],
  ["抗う","あらが"],["抗っ","あらが"],["抗わ","あらが"],["抗え","あらが"],["抗お","あらが"],//["抗い","あらが"],抵抗いえーーい、とかでも「抵あがらいえーい」なっちゃうから、やめとく。
  ["最期","さいご"],["潔く","いさぎよ"],["忌まわしき","いま"],["癒や","い"],
  ["末裔","まつえい"],["終焉","しゅうえん"],["結末","けつまつ"],
  ["辿り","たど"],["辿る","たど"],["伴う","ともな"],["伴っ","ともな"],
  ["拒ま","こば"],["拒み","こば"],["拒む","こば"],["拒め","こば"],["拒も","こば"],
  ["誠意","せいい"],["往生際","おうじょうぎわ"],["不甲斐ない","ふがい"],["自惚れ","うぬぼ"],["相まみえ","あい"],
  ["馳せ","は"],["罵倒","ばとう"],["媚を","こび"],["眉を","まゆ"],
  ["見出さ","みいだ"],["見出し","みいだ"],["見出す","みいだ"],["見出せ","みいだ"],["見出そ","みいだ"],["正念場","しょうねんば"],
 //	要らない。 ["報われ","むく"],["報い","むく"],["報う","むく"],["報え","むく"],["報お","むく"],//「情報われた」とか「情報うまうま」とか、「情報いただき」とかでも、情むくいただき、になってしまう。
  // みんつく　シナリオ用
  ["余興","よきょう"],["姑息","こそく"],["卑怯","ひきょう"],["愛称","あいしょう"],["凄まじい","すさ"],
  ["授け","さず"],["莫大","ばくだい"],

  // レヴアース用。メニューや各種ステータスなど。
    // ["縁を","えん"] 通貨の単位にこれ使う時は気をつけて。みどり、とも読むよ。 
 // ["存在する","そんざい"],// ["存在し","そんざい"],["存在に","たましい"],["存在が","たましい"],// これはレヴアース専用の読み方。そんざい、とはよまない。でも、そんざい、と読みたい時もあるので、存在（たましい）と書くだけに仕様。
  //["レヴェル","カルマ"],//Autoルビの場合は、カタカナにルビは打てないよ。これもレヴアース線用の読み方。のちにLVの表記は変更される。
  ["天子音","てんしょん"],//これもレヴアース専用の読み方。てんしおん、とは読まない。
  ["憑依","ひょうい"],
  ["鏡","かがみ"],//総ての「鏡」を「ステータス」と読んでいいものか。一文字に五文字は変になるよ。かがみにしよう。
  ["審判","しんぱん"],//総ての「審判」を「タイトル」と読んでいいものか。しんぱん、にしようかな。
 // ["断る","ことわ"],//これは読める。
  // ["現実世界","げんじつせかい"], // リアルと読みたいヒトも要るかもしれないので、やめとく
  ["臨界点","りんかいてん"],["限界点","げんかいてん"],//HP最大値、MP最大値だけ、特殊な言い方をしたいので、いちおうふりがなをふっておく。


// 装備品など。
  ["浄化","じょうか"],["穢れ","けがれ"],["範囲","はんい"],["言霊","ことだま"],["溺愛","できあい"],
  ["防止","ぼうし"],["帽子","ぼうし"],["指輪","ゆびわ"],["腕輪","うでわ"],["首飾り","くびかざり"],["常時","じょうじ"],
  ["記憶","きおく"],["寿命","じゅみょう"],["霊","れい"],
  ["逆刃刀","さかばとう"],["九頭龍閃","くずりゅうせん"],["天翔龍閃","あまかけるりゅうのひらめき"],

// "検索でヒットさせる文字"が２文字
//["一時","いっとき"],//いちじ、とも読むから、やめておこう。
["理想","りそう"],["異変","いへん"],["代弁","だいべん"],["寸法","すんぽう"],["概ね","おおむ"],["響き","ひびき"],["厳か","おごそ"],["凄い","すご"],
["輪廻","りんね"],["甲斐","かい"],["概念","がいねん"],["自愛","じあい"],["自重","じちょう"],["自戒","じかい"],["自省","じせい"],["内省","ないせい"],
["闘わ","たたか"],["闘っ","たたか"],["闘い","たたか"],["闘う","たたか"],["闘え","たたか"],["闘お","たたか"],//戦いとは明確に区別したい
//["一端","いっぱし"],のツクラーなら、とか、["一端","いったん"],を担う、とかもある、から、やめとこうか。
["挫折","ざせつ"],["頓挫","とんざ"],["各々","おのおの"],
["感銘","かんめい"],["未踏","みとう"],["採択","さいたく"],["採用","さいよう"],["無償","むしょう"],["寄付","きふ"],["寄与","きよ"],
["敬意","けいい"],["経緯","けいい"],["恩恵","おんけい"],["恩赦","おんしゃ"],["潔い","いさぎよ"],["潔く","いさぎよ"],
//["著作","ちょさく"],//子どもには必要ないかも。強調するのもなぁ‥。

// ■システム、装備やアイテム説明用。必要に応じて編集してください。
// "検索でヒットさせる文字"が２文字
["腕輪","うでわ"],//指輪・ゆびわ、があるので、一応。
["連携","れんけい"],//意外に読めない子や人が多い気がする。
["革命","かくめい"],//今の子は意外と読める‥‥？
["精魂","せいこん"],//これは流石に読めない‥‥？

// ■その他、戦闘や、スキル、システム等。
// "検索でヒットさせる文字"が２文字
//  ["愛","あい"],// ラヴ、とよませたかった、それでも・・？　とりあえずなしにしておこう。
  ["会心","かいしん"],["痛恨","つうこん"],["渾身","こんしん"],["怒涛","どとう"],["華麗","かれい"],["瞬速","しゅんそく"],
  ["俊敏","しゅんびん"],["翻弄","ほんろう"],
  
//  ■その他、スキル。
 ["抱擁","ほうよう"], ["灼熱","しゃくねつ"], ["咆哮","ほうこう"],["爆裂拳","ばくれつけん"],["炎翔脚","えんしょうきゃく"],

// ↓元からあった、デフォルトのやつは以下。
//     メルサイアがちょっとだけ編集（ルビ間違いになりそうなやつを一部削除、もしくは送り仮名を入れなおす）。

// 漢字＋送り仮名が３文字の場合
["大丈夫","だいじょうぶ"],
// この辺、いるかなぁ…。ゲームする子どもはもう知ってるから、要らない気がする‥
//["経験値","けいけんち"],["敏捷性","びんしょうせい"],["魔法力","まほうりょく"],["防御力","ぼうぎょりょく"],["攻撃力","こうげきりょく"],

// 漢字＋送り仮名が１～２文字
["中腹","ちゅうふく"],["引退","いんたい"],["間近","まぢか"],["機能","きのう"],
//["世界","せかい"],["時代","じだい"], // これも要らない気がする。日常生活に触れていたら、普通に読める。
//["小さ","ちい"],["用語","ようご"],["少し","すこ"], // 流石にここも要らないと思う。
["登録","とうろく"],["勝手","かって"],["渓流","けいりゅう"],["退治","たいじ"],["屋敷","やしき"],
//["同じ","おな"],["確か","たし"],["部屋","へや"],// これも要らない気がする。
["基準","きじゅん"],["葬式","そうしき"],
//["考え","かんが"],//これも要らないと思う
["其々","それぞれ"],["一応","いちおう"],["問題","もんだい"],["顕現","けんげん"],["刃物","はもの"],["我々","われわれ"],["用件","ようけん"],["寂し","さみ"],
["一生","いっしょう"],["邪気","じゃき"],["人間","にんげん"],["隔た","へだ"],
//["大き","おお"],//これも要らないと思う。なぜいれた…[大,だい]と差別化するため？
["案外","あんがい"],["大分","だいぶ"],["長け","た"],
//["漢字","かんじ"],//これも要らないよね。
//["楽し","たの"],//読めるよね。
["本来","ほんらい"],
//["音楽","おんがく"],//これも要らないと思う。どうせなら、効果音、こうかおんの方では。
["手動","しゅどう"],["私達","わたしたち"],["俺達","おれたち"],["過ご","す"],["見本","みほん"],["一緒","いっしょ"],
["貴重","きちょう"],["離れ","はな"],["現に","げん"], 
//["化け","ば"],//「進化（しんか）けもの」、とか、あるかもしれないので、やめておく。
["機会","きかい"],
//["魔法","まほう"],["防御","ぼうぎょ"],// これも要らないと思う。ゲームやってる子は読める。
["浄化","じょうか"],["初め","はじ"],["視界","しかい"],
//["来る","く"], // くる、と、きたる、があるから、要らないのでは。
//["攻撃","こうげき"], // これは要らないのでは。戦闘中、処理速度に影響があるとユーザに思われて、OFFにされるともったない。
["穢れ","けが"],["範囲","はんい"],["終了","しゅうりょう"],["並び","なら"],// この辺りはいるかも。
//["的な","てき"], // ターゲットが有効な的（まと）ならば、…とか、ありそうだし、的だけルビが付いているのはおかしいので、やめておく。
["真ん","ま"],["仮名","がな"],// 読めないこと多いと思う。
//["現在","げんざい"],["最強","さいきょう"],//これも要らない気がする。
["外す","はず"],//読めないヒトも。
//["全て","すべ"],//これも普通に読める。
["防止","ぼうし"],//あっていいと思う。
//["帽子","ぼうし"],これも要らない。確かに読めない子・人も多いが、盾とか服とかはないのに。帽子だけルビついてるのは変。
["指輪","ゆびわ"],//腕輪にルビをふるなら、あってもいいかも。
["常時","じょうじ"],//オプションのよみがな。読めないヒトいそうなので、入れておく。
["記憶","きおく"],["音量","おんりょう"],//オプションのよみがな。いるかもしれないので、一応入れておく。
//["受け","う"],//これも要らない。「ダメージを受けた」でいちいちルビを表示していたら、処理速度に影響があるとユーザに思われてしまうかも。
["慣れ","な"],["寿命","じゅみょう"],// これは要ると思う。

// 漢字＋送り仮名が１文字。
//     １文字のやつは、送り仮名によってはルビ間違いになることが多々あるから、
//     メルサイアが大部分を削除。
//riruさんの元のやつ ["楽","らく"],["振","ふ"],["中","なか"],["送","おく"],["集","あつ"],["扱","あつか"],["思","おも"],["感","かん"],["味","あじ"],["読","よ"],["書","か"],["使","つか"],["語","ご"],["手","て"],["梅","うめ"],["見","み"],["入","はい"],["聴","き"],["鉄","てつ"],["物","もの"],["与","あた"],["技","わざ"],["霊","れい"],["下","した"],["渡","わた"],["継","つ"],["人","ひと"],["飯","めし"],["力","ちから"],["眠","ねむ"],["頼","たの"],["塊","かたまり"],["来","き"],["行","い"],["落","お"],["言","い"],["他","ほか"],["切","き"],["時","とき"],["守","まも"],["私","わたし"],["埃","ほこり"],["刀","がたな"],["化","か"],["身","み"],["願","ねが"],["年","ねん"],["俺","おれ"],["長","なが"],["一","いち"],["伺","うかが"],["番","ばん"],["欠","か"],["寝","ね"],["主","あるじ"],["食","く"],["何","なに"],["屋","や"],["傍","そば"],["町","まち"],["研","と"],["替","か"],["服","ふく"],["盾","たて"],["次","つぎ"],["南","みなみ"],["着","つ"],["杖","つえ"],["永","なが"],["溜","た"],["君","きみ"]
["霊","れい"],
//["継ぐ","つ"],["継げ","つ"],//これも入れると、「私の後継ぐらいつとめてくれ」、とかでへんになるかや、やめよう
//["眠っ","ねむ"],//要るかなぁ…。要らないよね。
];
    return ruby_dic;
};
riru_Ruby_Message_processstartMessage =
		Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
    riru_Ruby_Message_processstartMessage.call(this);
    if(p_auto_Ruby)this._textState.text = this.convertEscapeCharacters($gameMessage.createRubytext($gameMessage.allText()));
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(this._textState.text)))this._textState.y += 6+ruby_c_size;
};
Game_Message.prototype.ruby_e_hantei = function(text) {
   var text_re = new RegExp("\x1br\\[(.*?),.*?\\]","img");//textの正規表現
return text_re.test(text);
};
Game_Message.prototype.createRubytext = function(alltext) {
var ruby_dic = $gameMessage.rubyDictionary();
     //送り仮名
     var kana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよわをんらりるれろぁぃぅぇぉっゃゅょゎゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオガギグゲゴカキクケコザジズゼゾサシスセソダヂヅデドタチツテトバビブベボナニヌネノパピプペポハヒフヘホァィゥェォマミムメモッャュョヮヤユヨワンラリルレロヴヲ"; 
     for (var i = 0; i < ruby_dic.length; i++) {
       var text = ruby_dic[i][0];//ルビが振られる漢字
       var text_re = new RegExp("(\\s|^|\\]|\\\\)"+"([^\\[]*?)"+text+"([^,]*?)"+"(\\s|\\\\|$)","mg");//前に[がない(手動でルビを振っているもの以外）辞書漢字
       //iに使用されている漢字が他の２文字以降にもある場合（例i:楽　他：音楽）、
       if (text_re.test(alltext)) {//辞書内i番の文字があるか？
         var kana_re = new RegExp("["+kana+"]","mg");//ひらがなが一文字でもある場合の正規
         var kana_ar = text.match(kana_re);
         var okurigana = "";
         if (text.match(kana_re)) {//送り仮名があった場合送り仮名を作成
           for (var j = 0; j < kana_ar.length; j++) {//送り仮名のみの文字列作成
             okurigana += kana_ar[j][0];
           }
         }    
         //ルビ制御文字に置換
         var after_text = text.replace(kana_re, "");//かなを取り除いた文字列
         alltext = alltext.replace(text_re, "$1$2\\R["+after_text+","+ruby_dic[i][1]+"]"+okurigana+"$3$4" );
         //マッチした文字列の中に複数対象があった場合
         var text_match = alltext.match(text_re);//マッチした配列
         var text_text_re = new RegExp(text,"mg");//textの正規表現
         var text_rep_count = 0;//置換する回数
         if (text_match){
           for (var k = 0; k < text_match.length; k++) {
             if(text_match[k].match(text_text_re)){
               var text_match_match = text_match[k].match(text_text_re);
               for (var l = 0; l < text_match_match.length; l++) {
                 text_rep_count++;
               }  
             }
           }  
         }  
         for (var m = 0; m < text_rep_count; m++) {
         alltext = alltext.replace(text_re, "$1$2\\R["+after_text+","+ruby_dic[i][1]+"]"+okurigana+"$3$4" );
         }         
       }  
     } 
   return alltext;  
};
Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {//再定義
    if (text&&typeof text == "string") {
        var textState = { index: 0, x: x, y: y, left: x };
        if(p_data_auto_Ruby){
          textState.text = this.convertEscapeCharacters($gameMessage.createRubytext(text));
        }else{
           textState.text = this.convertEscapeCharacters(text);
        }    
        textState.height = this.calcTextHeight(textState, false);
        var text_length_text = textState.text;//制御文字を抜いた文字長さ
         var text_length_re = new RegExp("\x1br\\[(.*?),.*?\\]","img");//textの正規表現
         text_length_text = text_length_text.replace(text_length_re, "$1" );
        if (this.textWidth(text_length_text)<maxWidth){
          if (align === 'center') {
              textState.x += (maxWidth - this.textWidth(text_length_text)) / 2;
          }else if (align === 'right') {
              textState.x += maxWidth - this.textWidth(text_length_text);
          }
        } 
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(textState.text)))textState.y += 6+ruby_c_size;//字下げ
          hankaku = new RegExp("[ -~｡-ﾟ]","img");//半角が含まれているもの // セーブ時の時刻用にmerusaiaが正規表現の末尾に"|："（全角コロン「：」も含めるを追加） //hankaku = new RegExp("([A-Z]|[0-9]| |[ｦ-ﾟ]|：)","img");//半角が含まれているもの。 // 元のもの hankaku = new RegExp("([A-Z]|[0-9]| |[ｦ-ﾟ])","img");//半角が含まれているもの。
          
        var hankaku_text = text_length_text.match(hankaku);//半角がいくつ含まれているかマッチ
        if (hankaku_text == null) hankaku_text = [];
        if (hankaku_text.length == 0){
    var hankaku_width =  Math.min(maxWidth/text_length_text.length,this.textWidth(text_length_text)/text_length_text.length);//一文字あたりの幅
    hankaku_width /= 2;
        }else{  
          var hankaku_width = (this.textWidth(text_length_text)-(text_length_text.length-hankaku_text.length)*this.contents.fontSize)/text_length_text.length;//半角の状態での一文字あたりの幅
        }
     hankaku_textwidth = Math.min(maxWidth/(hankaku_text.length+((text_length_text.length-hankaku_text.length)*2)),this.contents.fontSize/2);
     zenkaku_textwidth =  Math.min(maxWidth/((hankaku_text.length+((text_length_text.length-hankaku_text.length)*2))/2),this.contents.fontSize);
        while (textState.index < textState.text.length) {
        
          switch (textState.text[textState.index]) {
          case '\x1b':
           if (this.obtainEscapeCode(textState)=='R') {
             this.makerubydraw(textState);
            }
            break;
          default:
            this.processNormalCharacterruby(textState);
            break;
          }
        }
    }else{  
      if(p_Jisage==0)y += 6+ruby_c_size;//riru追加字下げ
      this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
    }    
};
Window_Base.prototype.processNormalCharacterruby = function(textState) {//drawtext用
    var c = textState.text[textState.index++];
    if (c.match(hankaku)) {//半角の場合
      var w = hankaku_textwidth;
    }else{
      var w = zenkaku_textwidth;
    } 
    this.contents.drawText(c, textState.x, textState.y, w, textState.height);
    textState.x += w;
};
Window_Base.prototype.makerubydraw = function(textState) {//drawtext用
 var ruby = this.obtainEscapeParampex(textState).split(",");
    var ow = this.textWidth(ruby[0]);
    var w = 0;
    if (hankaku.test(ruby[0])){//半角が入っているか？
     for (var i = 0; i < ruby[0].match(hankaku).length; i++) {
       w += hankaku_textwidth;
     } 
     w += (ruby[0].length-ruby[0].match(hankaku).length)*zenkaku_textwidth;
    }else{
    var w = zenkaku_textwidth*ruby[0].length;
    } 
         this.contents.fontSize /= 3;
         this.contents.fontSize += ruby_c_size;
    this.contents.drawText(ruby[1], textState.x, textState.y-this.contents.fontSize*2-6+ruby_c_size, w, textState.height+10,'center');
         this.contents.fontSize -= ruby_c_size;
         this.contents.fontSize *= 3;
    this.contents.drawText(ruby[0], textState.x, textState.y, w, textState.height);
    textState.x += w;
};

Window_Base.prototype.drawTextEx = function(text, x, y) {//再定義
    if (text) {
        var textState = { index: 0, x: x, y: y, left: x };
        if(p_help_auto_Ruby){
          textState.text = this.convertEscapeCharacters($gameMessage.createRubytext(text));
        }else{
          textState.text = this.convertEscapeCharacters(text);
        }    
        textState.height = this.calcTextHeight(textState, false);
        this.resetFontSettings();
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(textState.text)))textState.y += 6+ruby_c_size;//riru追加
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        return textState.x - x;
    } else {
        return 0;
    }
};

riru_Ruby_Message_processEscapeCharacter =
		Window_Base.prototype.processEscapeCharacter;
Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'R':
        this.makeruby(textState);
      break;
    default:
      riru_Ruby_Message_processEscapeCharacter.call(this,
				code, textState);
      break;
    }
};
Window_Base.prototype.makeruby = function(textState) {
 var ruby = this.obtainEscapeParampex(textState).split(",");
    var ow = this.textWidth(ruby[0]);
         this.contents.fontSize /= 3;
         this.contents.fontSize += ruby_c_size;
    var w = this.textWidth(ruby[0]);
    this.contents.drawText(ruby[1], textState.x, textState.y-this.contents.fontSize*2-6+ruby_c_size, ow, textState.height+10,'center');
         this.contents.fontSize -= ruby_c_size;
         this.contents.fontSize *= 3;
     w = this.textWidth(ruby[0]);
    this.contents.drawText(ruby[0], textState.x, textState.y, w * 2, textState.height);
    textState.x += w;
};
Window_Base.prototype.obtainEscapeParampex = function(textState) {//riru文字も含めた判別
    var arr = /^\[(.*?)\]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[1];
    } else {
        return '';
    }
};
riru_Ruby_Message_processNewLine =
		Window_Base.prototype.processNewLine;
Window_Base.prototype.processNewLine = function(textState) {
    riru_Ruby_Message_processNewLine.call(this,textState);
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(textState)))textState.height -= Math.max(3+ruby_c_size, 2);//riru追加箇所
};
Window_Message.prototype.needsNewPage = function(textState) {//再定義
    return (!this.isEndOfText(textState) &&
            textState.y + textState.height > this.contents.height-ruby_c_size+3);
};

})();
