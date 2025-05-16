
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  // Contact form URL
  const contactFormUrl = "http://freetoolonline.com/contact-us.html?utm_source=external&utm_medium=projly&utm_content=forget-password";
  
  // Function to open contact form in a new tab
  const openContactForm = () => {
    console.log("Opening contact form URL:", contactFormUrl);
    window.open(contactFormUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-project-primary">Projly</h1>
          <p className="text-gray-600 mt-1">Lightweight Project Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              Password reset via email is currently not available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">
                To reset your password, please contact our support team through the contact form.
              </p>
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800">
                  Please include your username/email in your message so we can assist you with resetting your password.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={openContactForm} 
                className="w-full bg-project-primary hover:bg-orange-500 mt-4"
              >
                <span className="flex items-center justify-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to Contact Form
                </span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-project-primary hover:underline font-medium">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} VIB Bank. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
