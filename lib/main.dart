import "dart:async";

import "package:flutter/material.dart";
import "package:url_launcher/url_launcher.dart";

void main() {
  runApp(const SupportPathApp());
}

enum AppTab { home, chat, resources, sos, profile }
enum AppLang { en, hi }
enum ChatMode { text, call }

String tx(String en, String hi, AppLang lang) => lang == AppLang.hi ? hi : en;

// Global dark-mode notifier so MaterialApp can react outside widget tree
final _darkModeNotifier = ValueNotifier<bool>(false);

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
  static const blue = Color(0xFF1558A8);
  static const blueLight = Color(0xFFEBF2FC);
  static const emerald = Color(0xFF1A8C6E);
  static const emeraldLight = Color(0xFFE6F5F0);
  static const amber = Color(0xFFC96A0A);
  static const amberLight = Color(0xFFFEF3E5);
  static const danger = Color(0xFFB91C1C);
  static const dangerLight = Color(0xFFFEE2E2);
  static const text = Color(0xFF0D2137);
  static const textSub = Color(0xFF3D5A6E);
  static const textMuted = Color(0xFF8AA5BB);
  static const border = Color(0xFFD4E1EE);
  static const bg = Color(0xFFEFF3F8);
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
    return ValueListenableBuilder<bool>(
      valueListenable: _darkModeNotifier,
      builder: (context, isDark, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: "SupportPath",
          themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: AppColors.blue),
            scaffoldBackgroundColor: AppColors.bg,
            useMaterial3: true,
          ),
          darkTheme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.blue,
              brightness: Brightness.dark,
            ),
            useMaterial3: true,
          ),
          home: const SupportPathHome(),
        );
      },
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
  bool _darkMode = false;
  bool _recording = false;
  bool _botTyping = false;
  String _notifFreq = "weekly";
  String _inputText = "";

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
        backgroundColor: bg ?? AppColors.blue,
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
        actions: [
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: _triggerSOS,
            child: const Text("SOS"),
          ),
          const SizedBox(width: 12),
        ],
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
                              bg: _consented ? AppColors.blue : AppColors.border,
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
            decoration: const BoxDecoration(color: AppColors.blue),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CircleAvatar(backgroundColor: Colors.white, child: Icon(Icons.shield, color: AppColors.blue)),
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
      (tx("Text Check-ins", "चैट चेक-इन", _lang), "8", tx("This month", "इस माह", _lang), AppColors.blue),
      (tx("Call Check-ins", "कॉल चेक-इन", _lang), "4", tx("This month", "इस माह", _lang), AppColors.amber),
      (tx("Case Status", "केस की स्थिति", _lang), tx("Active", "सक्रिय", _lang), tx("FIR registered", "FIR दर्ज", _lang), const Color(0xFF6D51A6)),
      (tx("Counselor", "परामर्शदाता", _lang), "Dr. Meena", tx("Assigned", "नियुक्त", _lang), AppColors.emerald),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: AppColors.blue,
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
                      fg: AppColors.amber,
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
    final sentiments = [
      ("Good", "अच्छा", AppColors.emerald),
      ("Okay", "ठीक है", AppColors.blue),
      ("Worried", "चिंतित", AppColors.amber),
      ("Sad", "दुखी", const Color(0xFF6D51A6)),
      ("Angry", "गुस्सा", AppColors.danger),
    ];

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
                  color: AppColors.amber,
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
                          style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.amber),
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
                                : AppColors.blue,
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
                SizedBox(
                  height: 44,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    children: sentiments.map((s) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ActionChip(
                          label: Text(_lang == AppLang.hi ? s.$2 : s.$1),
                          onPressed: () => _sendMessage(_lang == AppLang.hi ? s.$2 : s.$1),
                          backgroundColor: s.$3.withOpacity(0.12),
                          labelStyle: TextStyle(color: s.$3, fontWeight: FontWeight.w700),
                        ),
                      );
                    }).toList(),
                  ),
                ),
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
        AppColors.blue,
        "https://socialjustice.gov.in/",
      ),
      (
        tx("National Legal Services Authority (NALSA)", "राष्ट्रीय विधिक सेवा प्राधिकरण", _lang),
        tx("Free legal representation and FIR support.", "मुफ्त कानूनी प्रतिनिधित्व और FIR सहायता।", _lang),
        AppColors.emerald,
        "https://nalsa.gov.in/",
      ),
      (
        tx("Psychosocial Rehabilitation Scheme", "मनोसामाजिक पुनर्वास योजना", _lang),
        tx("Counseling, trauma therapy, and psychiatric care.", "परामर्श, आघात चिकित्सा और मनोचिकित्सा।", _lang),
        const Color(0xFF6D51A6),
        "https://nhm.gov.in/",
      ),
    ];

    final helplines = [
      (tx("iCall Counseling", "iCall परामर्श", _lang), "9152987821", AppColors.blue),
      (tx("National Helpline", "राष्ट्रीय हेल्पलाइन", _lang), "14566", AppColors.emerald),
      (tx("NHRC Complaint", "NHRC शिकायत", _lang), "14433", AppColors.amber),
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
      (tx("Police", "पुलिस", _lang), "100", AppColors.blue),
      (tx("Counselor", "परामर्शदाता", _lang), "14566", AppColors.emerald),
      (tx("Emergency", "आपातकाल", _lang), "112", const Color(0xFF6D51A6)),
      ("NHRC", "14433", AppColors.amber),
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
          color: AppColors.blue,
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
          child: Column(
            children: [
              SwitchListTile(
                title: Text(tx("Monitoring Active", "निगरानी सक्रिय", _lang)),
                subtitle: Text(tx("Pause or stop anytime — your choice.", "कभी भी रोकें — आपकी इच्छा।", _lang)),
                value: _monitoring,
                onChanged: (v) => setState(() => _monitoring = v),
              ),
              SwitchListTile(
                title: Text(tx("Dark Mode", "डार्क मोड", _lang)),
                subtitle: Text(tx("Easier on the eyes at night.", "रात में आँखों के लिए।", _lang)),
                value: _darkMode,
                onChanged: (v) {
                  setState(() => _darkMode = v);
                  _darkModeNotifier.value = v;
                },
              ),
            ],
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
