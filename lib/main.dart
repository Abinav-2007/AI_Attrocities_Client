import "dart:async";

import "package:flutter/material.dart";
import "package:url_launcher/url_launcher.dart";

void main() {
  runApp(const SupportPathApp());
}

enum AppTab { home, chat, resources, sos, profile }
enum AppLang { en, hi }
enum ChatMode { text, call }

// Check-in question model
class CheckInQuestion {
  const CheckInQuestion({
    required this.id,
    required this.en,
    required this.hi,
    required this.options,
  });

  final int id;
  final String en;
  final String hi;
  final List<(String en, String hi)> options;
}

// Check-in questions
final List<CheckInQuestion> checkInQuestions = [
  CheckInQuestion(
    id: 1,
    en: "How are you feeling today?",
    hi: "आज आप कैसा महसूस कर रहे हैं?",
    options: [
      ("Good", "अच्छा"),
      ("Okay", "ठीक है"),
      ("Not great", "बहुत अच्छा नहीं"),
      ("Struggling", "संघर्ष कर रहे हैं"),
    ],
  ),
  CheckInQuestion(
    id: 2,
    en: "Have you felt safe this week?",
    hi: "क्या आप इस सप्ताह सुरक्षित महसूस कर रहे हैं?",
    options: [
      ("Yes, completely", "हाँ, पूरी तरह से"),
      ("Mostly safe", "ज्यादातर सुरक्षित"),
      ("Sometimes unsafe", "कभी-कभी असुरक्षित"),
      ("No, I feel unsafe", "नहीं, असुरक्षित महसूस करता हूँ"),
    ],
  ),
  CheckInQuestion(
    id: 3,
    en: "Are you able to sleep well?",
    hi: "क्या आप अच्छी नींद ले पा रहे हैं?",
    options: [
      ("Yes, sleeping well", "हाँ, अच्छी नींद आ रही है"),
      ("Sometimes", "कभी-कभी"),
      ("Difficulty sleeping", "नींद आने में कठिनाई"),
      ("Very poor sleep", "बहुत खराब नींद"),
    ],
  ),
  CheckInQuestion(
    id: 4,
    en: "Do you need any support right now?",
    hi: "क्या आपको अभी किसी सहायता की आवश्यकता है?",
    options: [
      ("No, I'm okay", "नहीं, मैं ठीक हूँ"),
      ("Legal guidance", "कानूनी मार्गदर्शन"),
      ("Counseling", "परामर्श"),
      ("Emergency help", "आपातकालीन सहायता"),
    ],
  ),
];

String tx(String en, String hi, AppLang lang) => lang == AppLang.hi ? hi : en;

// Removed dark mode - using light theme only

Future<void> _dial(String number) async {
  final uri = Uri(scheme: "tel", path: number);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  }
}

Future<void> _openUrl(String url) async {
  final uri = Uri.parse(url);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class AppColors {
  // Warm, vibrant, and cheerful color palette with good visibility
  static const sunsetOrange = Color(0xFFFF8A5B);
  static const sunsetOrangeLight = Color(0xFFFFF1EC);
  static const goldenYellow = Color(0xFFFFC857);
  static const goldenYellowLight = Color(0xFFFFFBF0);
  static const warmPink = Color(0xFFFF6B9D);
  static const warmPinkLight = Color(0xFFFFF0F5);
  static const skyBlue = Color(0xFF5DADE2);
  static const skyBlueLight = Color(0xFFEFF8FC);
  static const mintGreen = Color(0xFF58D68D);
  static const mintGreenLight = Color(0xFFEFFBF4);
  static const danger = Color(0xFFE74C3C);
  static const dangerLight = Color(0xFFFDEDEB);
  static const text = Color(0xFF2C3E50);
  static const textSub = Color(0xFF5D6D7E);
  static const textMuted = Color(0xFF95A5A6);
  static const border = Color(0xFFE0E6ED);
  static const bg = Color(0xFFFFFBF7);
  static const surface = Color(0xFFFFFFFF);
}

class ChatMessage {
  const ChatMessage({required this.id, required this.fromBot, required this.en, required this.hi});

  final int id;
  final bool fromBot;
  final String en;
  final String hi;
}

class SupportPathApp extends StatelessWidget {
  const SupportPathApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "SupportPath",
      themeMode: ThemeMode.light,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.sunsetOrange),
        scaffoldBackgroundColor: AppColors.bg,
        useMaterial3: true,
      ),
      home: const SupportPathHome(),
    );
  }
}

class SupportPathHome extends StatefulWidget {
  const SupportPathHome({super.key});

  @override
  State<SupportPathHome> createState() => _SupportPathHomeState();
}

class _SupportPathHomeState extends State<SupportPathHome> {
  AppLang _lang = AppLang.en;
  AppTab _tab = AppTab.home;
  ChatMode _chatMode = ChatMode.text;
  bool _onboarded = false;
  bool _consented = false;
  bool _sosActive = false;
  bool _monitoring = true;
  bool _recording = false;
  bool _botTyping = false;
  String _notifFreq = "weekly";
  String _inputText = "";
  
  // Check-in state
  bool _inCheckIn = false;
  int _currentQuestionIndex = 0;
  final Map<int, String> _checkInAnswers = {};

  final TextEditingController _controller = TextEditingController();

  // Mutable list — removed const so .add() works
  final List<ChatMessage> _messages = [
    const ChatMessage(
      id: 1,
      fromBot: true,
      en: "Namaste, Priya. How are you feeling today?",
      hi: "नमस्ते, प्रिया। आज आप कैसा महसूस कर रहे हैं?",
    ),
    const ChatMessage(
      id: 2,
      fromBot: true,
      en: "Select a response below, type freely, or switch to a voice call check-in above.",
      hi: "नीचे एक उत्तर चुनें, टाइप करें, या ऊपर वॉइस कॉल चेक-इन पर स्विच करें।",
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.add(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch,
        fromBot: false,
        en: text,
        hi: text,
      ));
      _inputText = "";
      _controller.clear();
      _botTyping = true;
    });

    Timer(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      setState(() {
        _botTyping = false;
        _messages.add(const ChatMessage(
          id: 999999,
          fromBot: true,
          en: "Thank you for sharing. Your response has been recorded. Your next check-in is Thursday, 11 September at 10:00 AM.",
          hi: "साझा करने के लिए धन्यवाद। आपकी प्रतिक्रिया दर्ज की गई है। अगला चेक-इन 11 सितंबर, गुरुवार को 10:00 AM है।",
        ));
      });
    });
  }

  void _startCheckIn() {
    setState(() {
      _inCheckIn = true;
      _currentQuestionIndex = 0;
      _checkInAnswers.clear();
      _messages.clear();
      _messages.add(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch,
        fromBot: true,
        en: "Let's begin your wellness check-in. I'll ask you a few questions.",
        hi: "चलिए आपकी wellness चेक-इन शुरू करते हैं। मैं आपसे कुछ प्रश्न पूछूंगा।",
      ));
    });
  }

  void _answerCheckInQuestion(String answer) {
    final question = checkInQuestions[_currentQuestionIndex];
    
    setState(() {
      _checkInAnswers[question.id] = answer;
      
      // Add user's answer to chat
      _messages.add(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch,
        fromBot: false,
        en: answer,
        hi: answer,
      ));
      
      _botTyping = true;
    });

    Timer(const Duration(milliseconds: 800), () {
      if (!mounted) return;
      
      setState(() {
        _botTyping = false;
        
        if (_currentQuestionIndex < checkInQuestions.length - 1) {
          // Move to next question
          _currentQuestionIndex++;
        } else {
          // Check-in complete
          _inCheckIn = false;
          _messages.add(ChatMessage(
            id: DateTime.now().millisecondsSinceEpoch + 1,
            fromBot: true,
            en: "Thank you for completing your check-in. Your responses have been recorded securely. Your next check-in is Thursday, 11 September at 10:00 AM.",
            hi: "चेक-इन पूरा करने के लिए धन्यवाद। आपकी प्रतिक्रियाएं सुरक्षित रूप से दर्ज की गई हैं। अगला चेक-इन 11 सितंबर, गुरुवार को 10:00 AM है।",
          ));
        }
      });
    });
  }

  void _triggerSOS() {
    setState(() => _sosActive = true);
    _dial("112");
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(tx("Leave Programme?", "कार्यक्रम छोड़ें?", _lang)),
        content: Text(tx(
          "You can rejoin at any time. Your data will be kept safe.",
          "आप किसी भी समय फिर से जुड़ सकते हैं। आपका डेटा सुरक्षित रखा जाएगा।",
          _lang,
        )),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(tx("Cancel", "रद्द करें", _lang)),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () {
              Navigator.of(ctx).pop();
              setState(() {
                _onboarded = false;
                _consented = false;
                _tab = AppTab.home;
              });
            },
            child: Text(tx("Leave", "छोड़ें", _lang)),
          ),
        ],
      ),
    );
  }

  Widget _pillButton({required String label, required VoidCallback onTap, Color? bg, Color? fg}) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: bg ?? AppColors.sunsetOrange,
        foregroundColor: fg ?? Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: Text(label),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_onboarded) return _buildOnboarding();

    final pageTitle = {
      AppTab.home: tx("Home", "होम", _lang),
      AppTab.chat: tx("Chat", "चैट", _lang),
      AppTab.resources: tx("Support & Resources", "सहायता", _lang),
      AppTab.sos: "SOS",
      AppTab.profile: tx("Profile", "प्रोफ़ाइल", _lang),
    }[_tab]!;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(pageTitle, style: const TextStyle(fontWeight: FontWeight.w700)),
            Text(
              tx("Sunday, 7 September 2026", "रविवार, 7 सितंबर 2026", _lang),
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
      drawer: _buildDrawer(),
      body: SafeArea(
        child: IndexedStack(
          index: _tab.index,
          children: [_buildHome(), _buildChat(), _buildResources(), _buildSOS(), _buildProfile()],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab.index,
        onDestinationSelected: (i) => setState(() => _tab = AppTab.values[i]),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.home_outlined), label: tx("Home", "होम", _lang)),
          NavigationDestination(icon: const Icon(Icons.chat_bubble_outline), label: tx("Chat", "चैट", _lang)),
          NavigationDestination(icon: const Icon(Icons.menu_book_outlined), label: tx("Support", "सहायता", _lang)),
          const NavigationDestination(icon: Icon(Icons.warning_amber_rounded), label: "SOS"),
          NavigationDestination(icon: const Icon(Icons.person_outline), label: tx("Profile", "प्रोफ़ाइल", _lang)),
        ],
      ),
    );
  }

  Widget _buildOnboarding() {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Align(
                        alignment: Alignment.centerRight,
                        child: SegmentedButton<AppLang>(
                          segments: const [
                            ButtonSegment(value: AppLang.en, label: Text("English")),
                            ButtonSegment(value: AppLang.hi, label: Text("हिंदी")),
                          ],
                          selected: {_lang},
                          onSelectionChanged: (s) => setState(() => _lang = s.first),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        tx("We are here to support you.", "हम आपकी सहायता के लिए यहाँ हैं।", _lang),
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        tx(
                          "A safe, confidential space to access support, legal resources, and your rights as a survivor.",
                          "सहायता, कानूनी संसाधन और पीड़ित के रूप में अपने अधिकारों तक पहुँचने के लिए एक सुरक्षित, गोपनीय स्थान।",
                          _lang,
                        ),
                        style: const TextStyle(color: AppColors.textSub),
                      ),
                      const SizedBox(height: 20),
                      CheckboxListTile(
                        value: _consented,
                        onChanged: (v) => setState(() => _consented = v ?? false),
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          tx(
                            "I agree to weekly wellness check-ins. I understand I can pause or stop at any time.",
                            "मैं साप्ताहिक चेक-इन के लिए सहमत हूँ। मैं कभी भी रोक सकता/सकती हूँ।",
                            _lang,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _pillButton(
                              label: tx("Begin Journey", "शुरू करें", _lang),
                              onTap: _consented ? () => setState(() => _onboarded = true) : () {},
                              bg: _consented ? AppColors.sunsetOrange : AppColors.border,
                              fg: _consented ? Colors.white : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      child: ListView(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: AppColors.sunsetOrange),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CircleAvatar(backgroundColor: Colors.white, child: Icon(Icons.shield, color: AppColors.sunsetOrange)),
                const SizedBox(height: 12),
                const Text("SupportPath", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                Text(tx("Case ID: SP-2847", "केस ID: SP-2847", _lang), style: const TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          // Language selector moved from AppBar into the sidebar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx("Language", "भाषा", _lang),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).colorScheme.primary,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 8),
                SegmentedButton<AppLang>(
                  segments: const [
                    ButtonSegment(value: AppLang.en, label: Text("English")),
                    ButtonSegment(value: AppLang.hi, label: Text("हिंदी")),
                  ],
                  selected: {_lang},
                  onSelectionChanged: (s) => setState(() => _lang = s.first),
                ),
              ],
            ),
          ),
          const Divider(height: 24),
          ...AppTab.values.map((tab) {
            final labels = {
              AppTab.home: tx("Home", "होम", _lang),
              AppTab.chat: tx("Chat", "चैट", _lang),
              AppTab.resources: tx("Support & Resources", "सहायता", _lang),
              AppTab.sos: tx("Emergency SOS", "आपातकालीन SOS", _lang),
              AppTab.profile: tx("Profile & Settings", "प्रोफ़ाइल", _lang),
            };
            const icons = {
              AppTab.home: Icons.home_outlined,
              AppTab.chat: Icons.chat_bubble_outline,
              AppTab.resources: Icons.menu_book_outlined,
              AppTab.sos: Icons.warning_amber_rounded,
              AppTab.profile: Icons.person_outline,
            };
            return ListTile(
              selected: _tab == tab,
              leading: Icon(icons[tab]),
              title: Text(labels[tab]!),
              onTap: () {
                setState(() => _tab = tab);
                Navigator.of(context).pop();
              },
            );
          }),
          const Divider(height: 24),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.danger),
            title: Text(
              tx("Pause or Leave Programme", "कार्यक्रम रोकें या छोड़ें", _lang),
              style: const TextStyle(color: AppColors.danger),
            ),
            onTap: () {
              Navigator.of(context).pop();
              _showLogoutDialog();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildHome() {
    final cards = [
      (tx("Text Check-ins", "चैट चेक-इन", _lang), "8", tx("This month", "इस माह", _lang), AppColors.warmPink),
      (tx("Call Check-ins", "कॉल चेक-इन", _lang), "4", tx("This month", "इस माह", _lang), AppColors.goldenYellow),
      (tx("Case Status", "केस की स्थिति", _lang), tx("Active", "सक्रिय", _lang), tx("FIR registered", "FIR दर्ज", _lang), AppColors.skyBlue),
      (tx("Counselor", "परामर्शदाता", _lang), "Dr. Meena", tx("Assigned", "नियुक्त", _lang), AppColors.mintGreen),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: AppColors.sunsetOrange,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx("Good morning, Priya", "शुभ प्रभात, प्रिया", _lang), style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text(
                  tx("Next check-in: Thursday, 11 Sep · 10:00 AM", "अगला चेक-इन: 11 सित॰, गुरुवार · 10:00 AM", _lang),
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  children: [
                    _pillButton(label: tx("Chat Check-in", "चैट चेक-इन", _lang), onTap: () => setState(() => _tab = AppTab.chat), bg: Colors.white24),
                    _pillButton(
                      label: tx("Voice Call Check-in", "वॉइस चेक-इन", _lang),
                      onTap: () => setState(() {
                        _tab = AppTab.chat;
                        _chatMode = ChatMode.call;
                      }),
                      bg: Colors.white,
                      fg: AppColors.goldenYellow,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(tx("Your Overview", "आपका अवलोकन", _lang), style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: cards.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.35, mainAxisSpacing: 8, crossAxisSpacing: 8),
          itemBuilder: (context, i) {
            final item = cards[i];
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.$1, style: const TextStyle(fontSize: 12, color: AppColors.textSub)),
                    const Spacer(),
                    Text(item.$2, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: item.$4)),
                    Text(item.$3, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildChat() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: SegmentedButton<ChatMode>(
            segments: [
              ButtonSegment(value: ChatMode.text, label: Text(tx("Chat Check-in", "चैट चेक-इन", _lang))),
              ButtonSegment(value: ChatMode.call, label: Text(tx("Voice Call Check-in", "वॉइस कॉल चेक-इन", _lang))),
            ],
            selected: {_chatMode},
            onSelectionChanged: (s) => setState(() => _chatMode = s.first),
          ),
        ),
        if (_chatMode == ChatMode.call)
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  color: AppColors.goldenYellow,
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(tx("Automated Voice Call Check-in", "स्वचालित वॉइस कॉल चेक-इन", _lang), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Text(
                          tx("An IVR call asks wellness questions in your language.", "IVR कॉल आपसे आपकी भाषा में प्रश्न पूछता है।", _lang),
                          style: const TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 12),
                        FilledButton(
                          style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.goldenYellow),
                          onPressed: () => _dial("9152987821"),
                          child: Text(tx("Initiate Automated Call Now", "अभी स्वचालित कॉल शुरू करें", _lang)),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(tx("Call Check-in History", "कॉल चेक-इन इतिहास", _lang), style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                ...[
                  ("Thu, 4 Sep 2026", "10:14 AM", "4m 32s", "Good", "अच्छा"),
                  ("Thu, 28 Aug 2026", "10:02 AM", "3m 15s", "Worried", "चिंतित"),
                  ("Thu, 21 Aug 2026", "—", "—", "—", "—"),
                ].map((h) {
                  return Card(
                    child: ListTile(
                      title: Text(h.$1),
                      subtitle: Text("${h.$2} • ${h.$3}"),
                      trailing: Text(_lang == AppLang.hi ? h.$5 : h.$4),
                    ),
                  );
                }),
              ],
            ),
          )
        else
          Expanded(
            child: Column(
              children: [
                if (!_inCheckIn)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.sunsetOrange,
                        minimumSize: const Size(double.infinity, 48),
                      ),
                      onPressed: _startCheckIn,
                      icon: const Icon(Icons.assignment_outlined),
                      label: Text(tx("Start Wellness Check-in", "wellness चेक-इन शुरू करें", _lang)),
                    ),
                  ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length + (_botTyping ? 1 : 0),
                    itemBuilder: (context, i) {
                      if (_botTyping && i == _messages.length) {
                        return Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                SizedBox(
                                  width: 10,
                                  height: 10,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                                SizedBox(width: 10),
                                Text("typing…", style: TextStyle(fontSize: 13)),
                              ],
                            ),
                          ),
                        );
                      }
                      final msg = _messages[i];
                      return Align(
                        alignment: msg.fromBot ? Alignment.centerLeft : Alignment.centerRight,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          constraints: const BoxConstraints(maxWidth: 320),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: msg.fromBot
                                ? Theme.of(context).colorScheme.surfaceContainerHighest
                                : AppColors.sunsetOrange,
                            borderRadius: BorderRadius.circular(14),
                            border: msg.fromBot
                                ? Border.all(color: Theme.of(context).colorScheme.outlineVariant)
                                : null,
                          ),
                          child: Text(
                            _lang == AppLang.hi ? msg.hi : msg.en,
                            style: TextStyle(color: msg.fromBot ? null : Colors.white),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (_inCheckIn && !_botTyping)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.sunsetOrangeLight,
                      border: Border(top: BorderSide(color: AppColors.border)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              tx("Question ${_currentQuestionIndex + 1} of ${checkInQuestions.length}",
                                  "प्रश्न ${_currentQuestionIndex + 1} / ${checkInQuestions.length}",
                                  _lang),
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSub,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.sunsetOrange,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                "${(((_currentQuestionIndex) / checkInQuestions.length) * 100).round()}%",
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _lang == AppLang.hi
                              ? checkInQuestions[_currentQuestionIndex].hi
                              : checkInQuestions[_currentQuestionIndex].en,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ...checkInQuestions[_currentQuestionIndex].options.map((option) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppColors.text,
                                minimumSize: const Size(double.infinity, 48),
                                alignment: Alignment.centerLeft,
                              ),
                              onPressed: () => _answerCheckInQuestion(_lang == AppLang.hi ? option.$2 : option.$1),
                              child: Text(_lang == AppLang.hi ? option.$2 : option.$1),
                            ),
                          );
                        }),
                      ],
                    ),
                  )
                else if (!_inCheckIn)
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        IconButton.filledTonal(
                          onPressed: () => setState(() => _recording = !_recording),
                          style: IconButton.styleFrom(backgroundColor: _recording ? AppColors.danger : null),
                          icon: Icon(_recording ? Icons.stop : Icons.mic),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            onChanged: (v) => _inputText = v,
                            onSubmitted: _sendMessage,
                            decoration: InputDecoration(
                              hintText: tx("Type your response…", "अपना उत्तर टाइप करें…", _lang),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              filled: true,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton.filled(
                          onPressed: () => _sendMessage(_inputText),
                          icon: const Icon(Icons.send),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildResources() {
    final schemes = [
      (
        tx("SC/ST Prevention of Atrocities Act", "SC/ST अत्याचार निवारण अधिनियम", _lang),
        tx("Legal protection and compensation support.", "कानूनी सुरक्षा और मुआवजा सहायता।", _lang),
        AppColors.sunsetOrange,
        "https://socialjustice.gov.in/",
      ),
      (
        tx("National Legal Services Authority (NALSA)", "राष्ट्रीय विधिक सेवा प्राधिकरण", _lang),
        tx("Free legal representation and FIR support.", "मुफ्त कानूनी प्रतिनिधित्व और FIR सहायता।", _lang),
        AppColors.skyBlue,
        "https://nalsa.gov.in/",
      ),
      (
        tx("Psychosocial Rehabilitation Scheme", "मनोसामाजिक पुनर्वास योजना", _lang),
        tx("Counseling, trauma therapy, and psychiatric care.", "परामर्श, आघात चिकित्सा और मनोचिकित्सा।", _lang),
        AppColors.mintGreen,
        "https://nhm.gov.in/",
      ),
    ];

    final helplines = [
      (tx("iCall Counseling", "iCall परामर्श", _lang), "9152987821", AppColors.warmPink),
      (tx("National Helpline", "राष्ट्रीय हेल्पलाइन", _lang), "14566", AppColors.mintGreen),
      (tx("NHRC Complaint", "NHRC शिकायत", _lang), "14433", AppColors.goldenYellow),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(tx("Support Helplines", "सहायता हेल्पलाइन", _lang), style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        ...helplines.map((h) {
          return Card(
            child: ListTile(
              leading: CircleAvatar(backgroundColor: h.$3.withOpacity(0.12), child: Icon(Icons.phone, color: h.$3)),
              title: Text(h.$1),
              subtitle: Text(h.$2),
              trailing: FilledButton.tonal(
                onPressed: () => _dial(h.$2),
                child: Text(tx("Call", "कॉल", _lang)),
              ),
            ),
          );
        }),
        const SizedBox(height: 14),
        Text(tx("Government Schemes", "सरकारी योजनाएँ", _lang), style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        ...schemes.map((s) {
          return Card(
            child: ExpansionTile(
              leading: CircleAvatar(backgroundColor: s.$3.withOpacity(0.12), child: Icon(Icons.info_outline, color: s.$3)),
              title: Text(s.$1),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s.$2, style: const TextStyle(color: AppColors.textSub)),
                      const SizedBox(height: 10),
                      FilledButton.tonal(
                        onPressed: () => _openUrl(s.$4),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.open_in_new, size: 16),
                            const SizedBox(width: 6),
                            Text(tx("Visit Official Website", "आधिकारिक वेबसाइट देखें", _lang)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildSOS() {
    final quickDial = [
      (tx("Police", "पुलिस", _lang), "100", AppColors.sunsetOrange),
      (tx("Counselor", "परामर्शदाता", _lang), "14566", AppColors.mintGreen),
      (tx("Emergency", "आपातकाल", _lang), "112", AppColors.warmPink),
      ("NHRC", "14433", AppColors.skyBlue),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: AppColors.dangerLight,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Text(
                  tx("One tap sends your location and an alert to authorities.", "एक टैप से आपका स्थान और अलर्ट अधिकारियों को भेजा जाता है।", _lang),
                  style: const TextStyle(color: AppColors.textSub),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 18),
                GestureDetector(
                  onTap: _triggerSOS,
                  child: Container(
                    width: 170,
                    height: 170,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const RadialGradient(colors: [Color(0xFFE53935), AppColors.danger]),
                      boxShadow: [BoxShadow(color: AppColors.danger.withOpacity(0.4), blurRadius: 18, offset: const Offset(0, 8))],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 32),
                        const SizedBox(height: 8),
                        const Text("SOS", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 24)),
                        const SizedBox(height: 6),
                        Text(
                          _sosActive ? tx("ALERT SENT", "अलर्ट भेजा", _lang) : tx("TAP TO ALERT", "टैप करें", _lang),
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ),
                if (_sosActive)
                  Padding(
                    padding: const EdgeInsets.only(top: 14),
                    child: Text(
                      tx("Live location shared with authorities", "अधिकारियों के साथ लाइव स्थान साझा किया गया", _lang),
                      style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Text(tx("Quick Dial", "त्वरित डायल", _lang), style: const TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: quickDial.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.35, mainAxisSpacing: 8, crossAxisSpacing: 8),
          itemBuilder: (context, i) {
            final d = quickDial[i];
            return Card(
              child: InkWell(
                onTap: () => _dial(d.$2),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.phone, color: d.$3),
                      const Spacer(),
                      Text(d.$1, style: TextStyle(color: d.$3, fontWeight: FontWeight.w700)),
                      Text(d.$2),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildProfile() {
    final options = [
      ("daily", tx("Daily", "दैनिक", _lang)),
      ("weekly", tx("Weekly", "साप्ताहिक", _lang)),
      ("biweekly", tx("Bi-weekly", "द्वि-साप्ताहिक", _lang)),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: AppColors.sunsetOrange,
          child: ListTile(
            leading: const CircleAvatar(backgroundColor: Colors.white24, child: Icon(Icons.person, color: Colors.white)),
            title: const Text("P****a D****", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
            subtitle: Text(
              tx("Case ID: SP-2847 · Language: English / Hindi", "केस ID: SP-2847 · भाषा: अंग्रेज़ी / हिंदी", _lang),
              style: const TextStyle(color: Colors.white70),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(tx("Check-in Frequency", "चेक-इन आवृत्ति", _lang), style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: options.map((o) {
                    final selected = _notifFreq == o.$1;
                    return ChoiceChip(
                      label: Text(o.$2),
                      selected: selected,
                      onSelected: (_) => setState(() => _notifFreq = o.$1),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: SwitchListTile(
            title: Text(tx("Monitoring Active", "निगरानी सक्रिय", _lang)),
            subtitle: Text(tx("Pause or stop anytime — your choice.", "कभी भी रोकें — आपकी इच्छा।", _lang)),
            value: _monitoring,
            onChanged: (v) => setState(() => _monitoring = v),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          style: OutlinedButton.styleFrom(foregroundColor: AppColors.danger),
          onPressed: _showLogoutDialog,
          child: Text(tx("Pause or Leave Programme", "कार्यक्रम रोकें या छोड़ें", _lang)),
        ),
      ],
    );
  }
}
