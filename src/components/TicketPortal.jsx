//TODOS: Paypal not working as of the moment due to update of package
//TODOS: Convert form to React Hook Form - ZOD
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import useSWR from "swr";
import { LoaderCircle, Minus, Plus, X } from "lucide-react";
import { getOptionByName } from "@/actions/option";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { applyPromoCode } from "@/actions/promo";

//Paypal
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { processPaypalPayment } from "@/actions/sale";

//Date FNS
import add from "date-fns/add";
import { utcToZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import getDay from "date-fns/getDay";
import nextThursday from "date-fns/nextThursday";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { fetcher } from "@/actions/fetcher";
import { createCheckout, createDragonPayCheckout, requestPaymayaCheckout } from "@/actions/sale";

import { useRouter } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";

//Forms
const TicketPortal = ({ open, onOpenChange }) => {
  const router = useRouter();

  const { data: paymentOptions } = useSWR({ url: "v1/payment-option" }, fetcher);
  const { data: ticketData } = useSWR({ url: "v1/ticket" }, fetcher);
  const { data: ticketFooterData } = useSWR({ name: "TICKETS_FOOTER" }, getOptionByName);

  //States
  const [loading, setLoading] = useState({
    promoCode: false,
  });

  const [message, setMessage] = useState({
    error: "",
    success: "",
  });

  const [validation, setValidation] = useState({
    cartItems: "",
    firstName: "",
    lastName: "",
    contactNumber: "",
    emailAddress: "",
    promoCode: "",
  });

  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    contactNumber: "",
  });

  const [cartItems, setCartItems] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [availablePaymentOptions, setAvailablePaymentOptions] = useState([]);

  //Promo Code
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [discount, setDiscount] = useState(0);

  //Effects
  useEffect(() => {
    if (ticketData && ticketData.length > 0)
      setCartItems(
        ticketData.map((item) => {
          return {
            status: item.status,
            _id: item._id,
            name: item.name,
            description: item.shortDescription,
            price: item.price,
            qty: 0,
          };
        }),
      );
  }, [ticketData]);

  useEffect(() => {
    if (paymentOptions && paymentOptions.length > 0) setAvailablePaymentOptions(paymentOptions);
  }, [paymentOptions]);

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
    }
  }, [open]);

  const showSteps = () => {
    if (currentStep === 1) return showStep1();
    if (currentStep === 2) return showStep2();
    if (currentStep === 3) return showStep3();
  };

  const showCartSummary = () => {
    return cartItems.map((item, index) => {
      if (item.qty > 0)
        return (
          <div className="flex justify-between text-base text-black" key={index}>
            <div>
              {item.qty} x {item.name}
            </div>
            <div>₱{(item.qty * item.price * 1).toFixed(2)}</div>
          </div>
        );

      return;
    });
  };

  const showStep1 = () => {
    return (
      <div>
        <Image
          src="/tickets-placeholder.png"
          width={300}
          height={125}
          alt="Tickets Image Background"
          className="w-full"
        />
        <div className="p-4 text-black">
          {showTickets()}
          {cartItems && cartItems.filter((item) => item.status == true).length > 0 && (
            <>
              <div className="text-right">
                <span className="total">
                  <strong>Total: </strong> ₱{computeTotal()}
                </span>
              </div>
              <div className="mt-4 text-xs text-neutral-500">
                *Tickets are valid until <strong>{computeExpiry()}</strong>
              </div>
              {ticketFooterData && (
                <div
                  className="mt-4 text-xs text-neutral-500"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(ticketFooterData.value) }}
                />
              )}
              {validation.cartItems && (
                <div className="text-xs font-medium text-right text-red-600">{validation.cartItems}</div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const showStep2 = () => {
    return (
      <div>
        <div className="p-4 text-black">
          <div className="mb-5 text-2xl text-center font-sigmar-one">Buy Tickets</div>
          {/* form */}
          <div>
            <div className="mb-3">
              <Label htmlFor="firstName" className="mb-1 text-xs font-bold text-neutral-700">
                First Name
                {validation.firstName && (
                  <span className="text-xs font-medium text-right text-red-600">{validation.firstName}</span>
                )}
              </Label>
              <Input
                type="text"
                id="firstName"
                placeholder="First Name"
                onChange={handleDetails("firstName")}
                className={`${validation.firstName ? "border-red-500" : ""}`}
                value={personalDetails.firstName}
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="lastName" className="mb-1 text-xs font-bold text-neutral-700">
                Last Name
                {validation.lastName && (
                  <span className="text-xs font-medium text-right text-red-600">{validation.lastName}</span>
                )}
              </Label>
              <Input
                type="text"
                id="lastName"
                placeholder="Last Name"
                onChange={handleDetails("lastName")}
                className={`${validation.lastName ? "border-red-500" : ""}`}
                value={personalDetails.lastName}
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="contactNumber" className="mb-1 text-xs font-bold text-neutral-700">
                Contact Number
                {validation.contactNumber && (
                  <span className="text-xs font-medium text-right text-red-600">{validation.contactNumber}</span>
                )}
              </Label>
              <Input
                type="text"
                id="contactNumber"
                placeholder="Contact Number"
                onChange={handleDetails("contactNumber")}
                className={`${validation.contactNumber ? "border-red-500" : ""}`}
                value={personalDetails.contactNumber}
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="email" className="mb-1 text-xs font-bold text-neutral-700">
                Email Address
                {validation.emailAddress && (
                  <span className="text-xs font-medium text-right text-red-600">{validation.emailAddress}</span>
                )}
              </Label>
              <Input
                type="text"
                id="email"
                placeholder="Email Address"
                onChange={handleDetails("email")}
                className={`${validation.emailAddress ? "border-red-500" : ""}`}
                value={personalDetails.email}
              />
            </div>
            <div className="mb-3">
              <Label htmlFor="confirmEmail" className="mb-1 text-xs font-bold text-neutral-700">
                Confirm Email Address
                {validation.confirmEmail && (
                  <span className="text-xs font-medium text-right text-red-600">{validation.confirmEmail}</span>
                )}
              </Label>
              <Input
                type="text"
                id="confirmEmail"
                placeholder="Confirm Email Address"
                onChange={handleDetails("confirmEmail")}
                className={`${validation.confirmEmail ? "border-red-500" : ""}`}
                autoComplete="chrome-off"
                value={personalDetails.confirmEmail}
              />
              <Label className="pl-2 mt-1 text-xs font-light">
                Please note that QR link will be sent on your provided email address
              </Label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const showStep3 = () => {
    return (
      <div className="p-4">
        <div className="mb-1 text-2xl text-center text-black font-sigmar-one">Buy Tickets</div>
        <div>
          <div className="mb-4 text-lg font-bold text-center text-black">Cart Summary</div>
          <div className="my-3">{showCartSummary()}</div>
          <div className="w-40 h-[1px] bg-black my-2 ml-auto"></div>

          {discount > 0 && (
            <>
              <div className="text-sm text-right text-black">Total: ₱{computeTotal().toFixed(2)}</div>
              <div className="text-sm text-right text-red-500">Promo Discount: - ₱{discount.toFixed(2)}</div>
            </>
          )}
          <div className="my-2 text-lg font-bold text-right text-black">
            Amount Due: ₱{(computeTotal() - discount).toFixed(2)}
          </div>
        </div>
        {showPromoCodeForm()}
        <div className="m-3 mx-auto text-center recatpcha-wrapper">
          {message.error && <div className="px-2 mb-2 text-xs text-red-600">{message.error}</div>}

          {message.success && <div className="px-2 mb-2 text-xs text-black">{message.success}</div>}
        </div>
        <div className="mt-4">
          {/* Paypal  */}
          {availablePaymentOptions.filter((po) => po.status == true).filter((po) => po.slug == "paypal").length ==
            1 && (
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                currency: "PHP",
                intent: "capture",
              }}
            >
              <PayPalButtons
                style={{
                  color: "gold",
                  label: "pay",
                  tagline: false,
                  layout: "horizontal",
                  borderRadius: 8,
                }}
                className="mb-1"
                forceReRender={[]}
                createOrder={createOrder}
                onApprove={onApprove}
              />
            </PayPalScriptProvider>
          )}

          {/* Paymaya */}
          {availablePaymentOptions.filter((po) => po.status == true).filter((po) => po.slug == "paymaya").length ==
            1 && (
            <Button className={`w-full mb-2 bg-sc-orange font-bold py-6`} onClick={handleCheckout("paymaya")}>
              Pay with Paymaya, Visa, Mastercard
              {loading["paymaya"] && <LoaderCircle className="animate-spin" />}
            </Button>
          )}

          {/* Dragonpay */}
          {availablePaymentOptions.filter((po) => po.status == true).filter((po) => po.slug == "dragonpay").length ==
            1 && (
            <Button className={`w-full mb-2 bg-sc-orange font-bold py-6`} onClick={handleCheckout("dragonpay")}>
              Pay with Dragonpay
              {loading["dragonpay"] && <LoaderCircle className="animate-spin" />}
            </Button>
          )}

          {/* Gcash */}
          {availablePaymentOptions.filter((po) => po.status == true).filter((po) => po.slug == "gcash").length == 1 && (
            <Button className={`w-full mb-2 bg-sc-orange font-bold py-6`} onClick={handleCheckout("paymaya")}>
              Pay with Gcash
              {loading["gcash"] && <LoaderCircle className="animate-spin" />}
            </Button>
          )}

          {/* BPI */}
          {availablePaymentOptions.filter((po) => po.status == true).filter((po) => po.slug == "bpi").length == 1 && (
            <Button className={`w-full mb-2 bg-sc-orange font-bold py-6`} onClick={handleCheckout("bpi")}>
              Pay with BPI Checkout
              {loading["bpi"] && <LoaderCircle className="animate-spin" />}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const showTickets = () => {
    if (cartItems && cartItems.filter((item) => item.status == true).length > 0) {
      return cartItems.map((ticket, index) => {
        if (ticket.status)
          return (
            <div className="mb-3" key={index}>
              <div className="mb-1 text-2xl font-sigmar-one">{ticket.name}</div>
              <div className="mb-3 text-sm font-light">{ticket.description}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    className="w-[1rem] h-[1rem] bg-white shadow-none text-black m-2 hover:text-white cursor-pointer"
                    onClick={() => handleRemoveItem(ticket)}
                  >
                    <Minus />
                  </Button>

                  <div className="mx-3 text-xl text-center w-[30px]">{ticket.qty}</div>
                  <Button
                    className="w-[1rem] h-[1rem] bg-white shadow-none text-black m-2 hover:text-white cursor-pointer"
                    onClick={() => handleAddItem(ticket)}
                  >
                    <Plus />
                  </Button>
                </div>
                <div className="price">₱{ticket.price}</div>
              </div>
            </div>
          );
      });
    } else {
      return (
        <div className="text-center text-black">
          <div className="text-lg font-bold">No tickets available</div>
          <div className="text-sm font-light">Please check back later</div>
        </div>
      );
    }
  };

  //Paypal Functions
  const createOrder = async (data, actions) => {
    //initiate cart items
    const items = cartItems
      .filter((item) => item.qty > 0)
      .map((item) => {
        return { _id: item._id, qty: item.qty };
      });

    //initiate customer details
    const buyerDetails = {
      customerName: `${personalDetails.firstName} ${personalDetails.lastName}`,
      email: personalDetails.confirmEmail,
      contactNumber: personalDetails.contactNumber,
    };

    const checkout = await createCheckout({
      cartItems: items,
      ...buyerDetails,
      promoCode: appliedCode,
    }).catch((err) => {
      setMessage({
        ...message,
        success: "",
        error: err.error,
      });
    });

    try {
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: checkout.refId,
            amount: {
              currency_code: "PHP",
              value: checkout.orderTotal,
            },
          },
        ],
        application_context: {
          brand_name: "Star City PH",
          shipping_preference: "NO_SHIPPING",
        },
      });
    } catch (err) {
      console.log(err);
      setMessage({
        success: "",
        error: "Selected payment method not available. Please try another payment method.",
      });
    }
  };

  const onApprove = (data, actions) => {
    return actions.order
      .capture()
      .then(async (details) => {
        const paypalResponse = {
          id: details.id,
          status: details.status,
          refId: details.purchase_units[0].reference_id,
          eventType: details.intent,
        };

        await processPaypalPayment(paypalResponse);
        return paypalResponse;
      })
      .then((data) => {
        onOpenChange(false);
        router.push(`/?refid=${data.refId}&payment=true`);
      })
      .catch((err) => {
        console.log("Error in Paypal: ", err);
      });
  };

  //Handlers
  const handleDetails = (index) => (e) => {
    const { value } = e.target;
    setPersonalDetails({ ...personalDetails, [index]: value });
  };

  const handleAddItem = (item) => {
    let newCounter = cartItems.map((row) => {
      if (item._id === row._id) {
        return { ...row, qty: row.qty + 1 };
      } else {
        return row;
      }
    });

    setCartItems(newCounter);
  };

  const handleRemoveItem = (item) => {
    let newCounter = cartItems.map((row) => {
      if (item._id === row._id) {
        if (row.qty == 0) return row;
        return { ...row, qty: row.qty - 1 };
      } else {
        return row;
      }
    });

    setCartItems(newCounter);
  };

  const showPromoCodeForm = () => {
    return (
      <div className="text-left">
        <Label className="mb-1 ml-1 font-bold text-black">
          Promo Code
          {validation.promoCode && <span className="text-xs font-light text-red-600">{validation.promoCode}</span>}
        </Label>
        {appliedCode == "" ? (
          <div className="flex items-center w-full space-x-2">
            <Input
              type="text"
              className="text-black uppercase"
              onChange={(e) => {
                setPromoCode(e.target.value);
              }}
              value={promoCode}
            />
            <Button type="submit" onClick={handleApplyPromoCode}>
              {loading.promoCode && <LoaderCircle className="animate-spin" />}
              Apply
            </Button>
          </div>
        ) : (
          <div className="flex items-center ml-2 text-black" onClick={handleRemovePromoCode}>
            <X className="w-[18px] mr-1" />
            <span className="text-sm uppercase">{appliedCode}</span>
          </div>
        )}
      </div>
    );
  };

  const handleRemovePromoCode = () => {
    setDiscount(0);
    setAppliedCode("");
    setPromoCode("");
    setAvailablePaymentOptions(paymentOptions);
    setValidation({ ...validation, promoCode: "" });
  };

  const handleApplyPromoCode = async () => {
    //validate code
    setLoading({ ...loading, promoCode: true });

    //if valid
    if (promoCode !== "") {
      setValidation({ ...validation, promoCode: "" });

      applyPromoCode({
        code: promoCode,
        transactionAmount: computeTotal(),
      })
        .then((data) => {
          setDiscount(data.discount);
          setAppliedCode(data.code);
          setAvailablePaymentOptions(data.paymentMethods);
          setLoading({ ...loading, promoCode: false });
        })
        .catch((err) => {
          setValidation({
            ...validation,
            promoCode: err.error,
          });
          setLoading({ ...loading, promoCode: false });
        });
    } else {
      setValidation({
        ...validation,
        promoCode: "Promo code invalid or expired",
      });
      setLoading({ ...loading, promoCode: false });
    }
  };

  const handleCheckout = (paymentOption) => (e) => {
    //Show loading state on clicked button
    setLoading({ ...loading, [paymentOption]: true });
    setMessage({
      ...message,
      success: "",
      error: "",
    });
    //initiate cart items
    const items = cartItems
      .filter((item) => item.qty > 0)
      .map((item) => {
        return { _id: item._id, qty: item.qty };
      });

    //initiate customer details
    const buyerDetails = {
      customerName: `${personalDetails.firstName} ${personalDetails.lastName}`,
      email: personalDetails.confirmEmail,
      contactNumber: personalDetails.contactNumber,
    };

    createCheckout({
      cartItems: items,
      ...buyerDetails,
      promoCode: appliedCode,
    })
      .then(async (data) => {
        setMessage({
          ...message,
          success: "Please wait. You will be redirected to payment page.",
          error: "",
        });
        setLoading({ ...loading, [paymentOption]: false });

        //forward checkout details to payment channel

        //BPI Payment
        if (paymentOption == "bpi") {
          window.location.href = `${process.env.NEXT_PUBLIC_BPI_CHECKOUT_URL}/${data.refId}?merchantId=${process.env.NEXT_PUBLIC_BPI_CLIENT_ID}&merchantName=Star City&amount=${data.orderTotal}&remarks=Payment to Star City`;
        }

        //Dragonpya Payment
        if (paymentOption == "dragonpay") {
          const params = {
            txnId: data.refId,
            amount: data.orderTotal,
            email: personalDetails.confirmEmail,
          };
          createDragonPayCheckout(params).then((data) => {
            console.log(data);
            window.location = data.Url;
          });
        }

        //Paymaya Payment
        if (paymentOption == "paymaya") {
          const paymayaCheckoutPayload = {
            customerFirstName: personalDetails.firstName,
            customerLastName: personalDetails.lastName,
            refId: data.refId,
          };

          try {
            const paymayaResponse = await requestPaymayaCheckout(paymayaCheckoutPayload);
            if (paymayaResponse && paymayaResponse.data.redirectUrl) {
              window.location.href = paymayaResponse.data.redirectUrl;
            } else {
              setMessage({
                ...message,
                success: "",
                error: "Paymaya redirect URL not available. Please try a different payment method.",
              });
            }
            console.log(paymayaResponse);
          } catch (error) {
            console.log(error);
            setMessage({
              ...message,
              success: "",
              error: "Paymaya request checkout occured. Please try a different payment method.",
            });
          }
        }

        //Paypal Payment
      })
      .catch((error) => {
        console.log(error);
        setLoading({ ...loading, [paymentOption]: false });
        if (error.error)
          setMessage({
            ...message,
            success: "",
            error: error.message || error.error,
          });
      });
  };

  //Helpers
  const computeTotal = () => {
    if (cartItems) {
      const total = cartItems.reduce((prev, current) => {
        const currentItemTotal = current.qty * current.price;

        return prev + currentItemTotal;
      }, 0);
      return total;
    }

    return 0;
  };

  const computeExpiry = () => {
    const adjustDays = [1, 2, 3];
    const expiryDate = utcToZonedTime(
      add(new Date(), {
        months: 1,
      }),
      "Asia/Manila",
    );
    const dayValue = getDay(expiryDate);
    const inAdjustDays = adjustDays.indexOf(dayValue);
    const shouldAdjust = inAdjustDays >= 0 ? true : false;
    let expiry = null;

    if (shouldAdjust) {
      expiry = format(nextThursday(expiryDate), "MMMM dd, yyyy");
    } else {
      expiry = format(expiryDate, "MMMM dd, yyyy");
    }

    return expiry;
  };

  const handleStepUp = () => {
    if (currentStep < 3) {
      //validations

      //if current step == 1 check if ticket count is != 0
      if (currentStep == 1) {
        if (currentStep == 1) {
          if (cartItems.filter((ticket) => ticket.qty > 0).length > 0) {
            setValidation({
              ...validation,
              cartItems: "",
            });
            setCurrentStep(currentStep + 1);
          } else {
            setValidation({
              ...validation,
              cartItems: "Tickets to buy should be at least 1",
            });
          }
        }
      }

      if (currentStep == 2) {
        if (
          personalDetails.firstName !== "" &&
          personalDetails.lastName !== "" &&
          personalDetails.confirmEmail !== "" &&
          personalDetails.contactNumber !== "" &&
          validateEmail(personalDetails.email) &&
          validateMobileNumber(personalDetails.contactNumber) &&
          validateEmailConfirmation(personalDetails.confirmEmail, personalDetails.email)
        ) {
          setCurrentStep(currentStep + 1);
          setValidation({
            ...validation,
            firstName: "",
            lastName: "",
            contactNumber: "",
            emailAddress: "",
            confirmEmail: "",
          });
        } else {
          setValidation({
            ...validation,
            firstName: personalDetails.firstName == "" ? "First Name is required" : "",
            lastName: personalDetails.lastName == "" ? "Last Name is required" : "",
            emailAddress:
              personalDetails.email == ""
                ? "Email Address is required"
                : validateEmail(personalDetails.email)
                  ? ""
                  : "Please enter a valid email address.",
            contactNumber:
              personalDetails.contactNumber == ""
                ? "Contact Number is required"
                : validateMobileNumber(personalDetails.contactNumber)
                  ? ""
                  : "Please enter a valid Philippine mobile number. Start with 09 or +63.",
            confirmEmail:
              personalDetails.confirmEmail == ""
                ? "Confirm Email Address is required"
                : validateEmailConfirmation(personalDetails.confirmEmail, personalDetails.email)
                  ? ""
                  : "Email confirmation is incorrect.",
          });
        }
      }

      //if current step == 2 check if name email contact number is empty
    }
  };

  const handleStepDown = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (currentStep === 1) {
      onOpenChange(false);
    }
  };

  //handle validation
  const validateEmail = (email) => {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (mailformat.test(email)) {
      return true;
    } else {
      return false;
    }
  };

  const validateEmailConfirmation = (email, confirmEmail) => {
    if (email == confirmEmail) {
      return true;
    } else {
      return false;
    }
  };

  const validateMobileNumber = (number) => {
    var numberFormat = /^(09|\+639)\d{9}$/;
    if (numberFormat.test(number)) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-h-[100vh] overflow-y-auto rounded-none border-0">
        <DialogTitle className="hidden">Ticket Portal</DialogTitle>
        <DialogHeader>
          <DialogDescription asChild>{showSteps()}</DialogDescription>
        </DialogHeader>
        {currentStep !== 3 && (
          <DialogFooter className="p-2">
            <Button variant="outline" onClick={handleStepDown}>
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button onClick={handleStepUp}>Next</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketPortal;
