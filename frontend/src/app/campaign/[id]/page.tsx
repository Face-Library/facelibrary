"use client";

import { useParams, redirect } from "next/navigation";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Campaigns are license requests in our system — redirect to the license detail page
  redirect(`/license/${id}`);
}
