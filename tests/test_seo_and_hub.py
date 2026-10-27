import unittest
import os
import xml.etree.ElementTree as ET

class TestSeoAndHub(unittest.TestCase):
    def setUp(self):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.index_html_path = os.path.join(self.root_dir, "index.html")
        self.static_index_html_path = os.path.join(self.root_dir, "static", "index.html")
        self.robots_path = os.path.join(self.root_dir, "robots.txt")
        self.sitemap_path = os.path.join(self.root_dir, "sitemap.xml")
        self.app_js_path = os.path.join(self.root_dir, "static", "app.js")
        self.styles_css_path = os.path.join(self.root_dir, "static", "styles.css")

    def test_robots_txt_exists_and_configured(self):
        self.assertTrue(os.path.exists(self.robots_path), "robots.txt must exist in root")
        with open(self.robots_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("User-agent: *", content)
        self.assertIn("Allow: /", content)
        self.assertIn("Sitemap:", content)

    def test_sitemap_xml_exists_and_valid(self):
        self.assertTrue(os.path.exists(self.sitemap_path), "sitemap.xml must exist in root")
        tree = ET.parse(self.sitemap_path)
        root = tree.getroot()
        self.assertTrue(len(root) >= 5, "Sitemap should contain all book anchors")
        with open(self.sitemap_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("https://rocketsciencedata.github.io/piano/", content)
        self.assertIn("#czerny-599", content)
        self.assertIn("#bach-first", content)

    def test_index_and_static_index_identical(self):
        with open(self.index_html_path, "r", encoding="utf-8") as f1:
            idx = f1.read()
        with open(self.static_index_html_path, "r", encoding="utf-8") as f2:
            st_idx = f2.read()
        self.assertEqual(idx, st_idx, "index.html and static/index.html must be strictly identical")

    def test_seo_metadata_in_html(self):
        with open(self.index_html_path, "r", encoding="utf-8") as f:
            html = f.read()
        # Meta descriptions and titles
        self.assertIn("<title>Piano Academie", html)
        self.assertIn('name="description"', html)
        self.assertIn('name="keywords"', html)
        self.assertIn('rel="canonical"', html)
        # Open Graph
        self.assertIn('property="og:title"', html)
        self.assertIn('property="og:description"', html)
        self.assertIn('property="og:image"', html)
        # Twitter Card
        self.assertIn('name="twitter:card"', html)
        # JSON-LD Schema
        self.assertIn('"@type": "WebApplication"', html)
        self.assertIn('"@type": "Course"', html)

    def test_pdf_downloads_removed(self):
        with open(self.index_html_path, "r", encoding="utf-8") as f:
            html = f.read()
        self.assertNotIn("menu-book-pdf-link", html, "PDF download link must be removed from menu view")
        self.assertNotIn("sheet-pdf-link", html, "PDF download link must be removed from sheet header")

    def test_flowkey_and_netflix_elements(self):
        with open(self.index_html_path, "r", encoding="utf-8") as f:
            html = f.read()
        # Flowkey hero & 3-step section
        self.assertIn("flowkey-hero", html)
        self.assertIn("flowkey-method-section", html)
        self.assertIn("hub-trust-strip", html)
        self.assertIn("books-catalog-grid", html)

        with open(self.styles_css_path, "r", encoding="utf-8") as f:
            css = f.read()
        self.assertIn(".hub-hero-card.flowkey-hero", css)
        self.assertIn(".netflix-book-card", css)
        self.assertIn('[data-theme="light"] .flowkey-step-card', css)
        self.assertIn('[data-theme="light"] .netflix-book-card', css)

    def test_flowkey_animated_hands_and_switcher(self):
        with open(self.index_html_path, "r", encoding="utf-8") as f:
            html = f.read()
        self.assertIn('id="keyboard-view-switch"', html)
        self.assertIn('id="btn-view-hands"', html)
        self.assertIn('id="btn-view-blocks"', html)
        self.assertIn('id="drawer-hand-mode-group"', html)
        self.assertIn('id="drawer-btn-mode-hands"', html)
        self.assertIn('id="drawer-btn-mode-blocks"', html)

        with open(self.styles_css_path, "r", encoding="utf-8") as f:
            css = f.read()
        self.assertIn(".keyboard-view-switch", css)
        self.assertIn(".piano-container.hands-mode", css)
        self.assertIn(".piano-animated-hands-overlay", css)
        self.assertIn(".hand-finger-active", css)
        self.assertIn(".finger-press-ripple", css)

        with open(self.app_js_path, "r", encoding="utf-8") as f:
            js = f.read()
        self.assertIn("function setKeyboardHandMode", js)
        self.assertIn("function applyKeyboardLayoutVisibility", js)
        self.assertIn("function renderHandSvgMarkup", js)
        self.assertIn("function updatePianoAnimatedHands", js)
        self.assertIn("piano-animated-hands-svg", js)

        # Check i18n
        i18n_path = os.path.join(self.root_dir, "static", "i18n.js")
        with open(i18n_path, "r", encoding="utf-8") as f:
            i18n_content = f.read()
        self.assertIn("view_mode_hands", i18n_content)
        self.assertIn("view_mode_blocks", i18n_content)

    def test_demo_mode_updates_target_and_hands(self):
        with open(self.app_js_path, "r", encoding="utf-8") as f:
            js = f.read()
        self.assertIn("function startDemo()", js)
        self.assertIn("state.activeTarget = item;", js)
        self.assertIn("highlightPianoTarget();", js)

    def test_grand_piano_sound_engine(self):
        with open(self.app_js_path, "r", encoding="utf-8") as f:
            js = f.read()
        self.assertIn("GRAND_PIANO_SAMPLES", js)
        self.assertIn("SALAMANDER_BASE_URL", js)
        self.assertIn("function findClosestPianoSample", js)
        self.assertIn("function playSampleBuffer", js)
        self.assertIn("function playPhysicalModelingGrand", js)
        self.assertIn("function preloadGrandPianoSamples", js)

    def test_app_py_seo_routes(self):
        import app
        
        res_robots = app.get_robots()
        self.assertEqual(res_robots.status_code, 200)

        res_sitemap = app.get_sitemap()
        self.assertEqual(res_sitemap.status_code, 200)

if __name__ == "__main__":
    unittest.main()
