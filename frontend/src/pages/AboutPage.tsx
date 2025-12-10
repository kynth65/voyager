import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ship,
  Target,
  Heart,
  Users,
  Award,
  Compass,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function AboutPage() {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar transparent={false} showAuthButtons={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #e3f6f5 0%, #bae8e8 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-20 left-20 w-64 h-64 rounded-full"
              style={{ background: "#272343" }}
            ></div>
            <div
              className="absolute bottom-20 right-20 w-96 h-96 rounded-full"
              style={{ background: "#272343" }}
            ></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm mb-6 shadow-sm">
              <Compass className="w-4 h-4 text-[#272343]" />
              <span className="text-[#272343] text-sm font-medium uppercase tracking-wider">
                About Voyager
              </span>
            </div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-light mb-6"
              style={{
                color: "#272343",
                letterSpacing: "-0.03em",
                fontFamily: '"Fraunces", serif',
              }}
            >
              Connecting Islands,
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #272343 0%, #5d576b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Creating Memories
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-light"
              style={{ color: "#5d576b" }}
            >
              We're on a mission to make ferry travel across the Philippines
              seamless, reliable, and accessible to everyone. From Manila to
              Mindanao, we connect you to your next adventure.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div
              className="relative rounded-3xl p-12 text-white overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #272343 0%, #3d3851 100%)",
              }}
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <Target className="w-full h-full transform rotate-12 group-hover:rotate-[18deg] transition-transform duration-700" />
              </div>
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(186, 232, 232, 0.2)" }}
                >
                  <Target className="w-8 h-8 text-[#bae8e8]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-light mb-6">
                  Our Mission
                </h2>
                <p className="text-[#bae8e8] text-lg leading-relaxed">
                  To revolutionize ferry travel in the Philippines by providing
                  a modern, user-friendly booking platform that makes island
                  hopping effortless and enjoyable for every traveler.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div
              className="relative rounded-3xl p-12 overflow-hidden group"
              style={{
                background: "#e3f6f5",
                border: "2px solid #bae8e8",
              }}
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <Heart className="w-full h-full transform rotate-12 group-hover:rotate-[18deg] transition-transform duration-700 text-[#272343]" />
              </div>
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "#bae8e8" }}
                >
                  <Heart className="w-8 h-8 text-[#272343]" />
                </div>
                <h2
                  className="text-3xl md:text-4xl font-light mb-6"
                  style={{ color: "#272343" }}
                >
                  Our Vision
                </h2>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "#5d576b" }}
                >
                  To become the most trusted and preferred ferry booking
                  platform in Southeast Asia, connecting communities and
                  fostering economic growth through accessible maritime
                  transportation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section
        className="py-24 md:py-32"
        style={{
          background: "linear-gradient(180deg, #e3f6f5 0%, #ffffff 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-light mb-6"
              style={{
                color: "#272343",
                letterSpacing: "-0.03em",
                fontFamily: '"Fraunces", serif',
              }}
            >
              What We{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #272343 0%, #5d576b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Stand For
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safety First",
                description:
                  "Passenger safety is our top priority. We partner only with certified vessels and experienced operators.",
                color: "#272343",
                bgColor: "#ffffff",
              },
              {
                icon: Users,
                title: "Customer Focused",
                description:
                  "Every decision we make is centered around delivering exceptional experiences to our travelers.",
                color: "#272343",
                bgColor: "#ffffff",
              },
              {
                icon: CheckCircle,
                title: "Reliability",
                description:
                  "On-time departures, instant confirmations, and 24/7 support you can count on.",
                color: "#272343",
                bgColor: "#ffffff",
              },
              {
                icon: TrendingUp,
                title: "Innovation",
                description:
                  "We continuously improve our platform with the latest technology to serve you better.",
                color: "#272343",
                bgColor: "#ffffff",
              },
              {
                icon: Heart,
                title: "Community",
                description:
                  "Supporting local maritime industries and connecting Filipino communities nationwide.",
                color: "#272343",
                bgColor: "#ffffff",
              },
              {
                icon: Award,
                title: "Excellence",
                description:
                  "Striving for perfection in every booking, every journey, every interaction.",
                color: "#272343",
                bgColor: "#ffffff",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{
                  border: "2px solid #e3f6f5",
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "#e3f6f5" }}
                >
                  <value.icon className="w-8 h-8" style={{ color: value.color }} />
                </div>
                <h3
                  className="text-2xl font-medium mb-4"
                  style={{ color: value.color }}
                >
                  {value.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "#5d576b", fontSize: "15px" }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "50+", label: "Active Routes" },
              { number: "100K+", label: "Happy Travelers" },
              { number: "98%", label: "On-Time Departures" },
              { number: "24/7", label: "Customer Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-5xl sm:text-6xl md:text-7xl font-light mb-4"
                  style={{
                    color: "#272343",
                    fontFamily: '"Fraunces", serif',
                  }}
                >
                  {stat.number}
                </div>
                <div
                  className="text-lg font-medium"
                  style={{ color: "#5d576b" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24 md:py-32"
        style={{
          background: "linear-gradient(135deg, #272343 0%, #3d3851 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Ship className="w-16 h-16 text-[#bae8e8] mx-auto mb-6" />
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-white"
            style={{
              letterSpacing: "-0.02em",
              fontFamily: '"Fraunces", serif',
            }}
          >
            Ready to Start Your Journey?
          </h2>
          <p
            className="text-lg mb-10 max-w-2xl mx-auto"
            style={{ color: "#bae8e8" }}
          >
            Join thousands of travelers who trust Voyager for seamless ferry
            bookings across the Philippines
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="group relative w-full sm:w-auto px-10 py-5 bg-white rounded-2xl font-medium transition-all duration-300 overflow-hidden hover:shadow-xl"
              style={{
                color: "#272343",
                fontSize: "16px",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="group w-full sm:w-auto px-10 py-5 rounded-2xl font-medium transition-all duration-300 border-2 hover:bg-white/10"
              style={{
                borderColor: "#bae8e8",
                color: "#bae8e8",
                fontSize: "16px",
              }}
            >
              Explore Routes
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
